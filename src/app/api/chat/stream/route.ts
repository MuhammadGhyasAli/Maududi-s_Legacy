import { NextRequest } from 'next/server';

const BACKEND_URL = process.env.BACKEND_API_URL || 'https://syedghyas.pythonanywhere.com';

function sseEvent(event: string, data: Record<string, unknown>): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { bookId, messages, language, conversationId } = body;

  if (!messages || !Array.isArray(messages)) {
    return Response.json({ error: 'messages are required' }, { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(encoder.encode(sseEvent('agent_status', {
          agent: 'orchestrator',
          message: 'Understanding your question...',
        })));

        controller.enqueue(encoder.encode(sseEvent('agent_status', {
          agent: 'researcher',
          message: "Searching through Maududi's works...",
        })));

        const backendRes = await fetch(`${BACKEND_URL}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookId, messages, language, conversationId }),
        });

        if (!backendRes.ok) {
          const errText = await backendRes.text();
          controller.enqueue(encoder.encode(sseEvent('error', {
            message: `Backend error: ${backendRes.status} ${errText}`,
          })));
          controller.close();
          return;
        }

        controller.enqueue(encoder.encode(sseEvent('agent_status', {
          agent: 'orchestrator',
          message: 'Done',
          done: true,
        })));

        controller.enqueue(encoder.encode(sseEvent('agent_status', {
          agent: 'researcher',
          message: 'Done',
          done: true,
          chunksFound: 1,
        })));

        controller.enqueue(encoder.encode(sseEvent('agent_status', {
          agent: 'synthesizer',
          message: 'Composing your answer...',
        })));

        const data = await backendRes.json();
        const responseText: string = data.response || '';
        const followUpQuestions: string[] = data.followUpQuestions || [];

        const words = responseText.split(' ');
        for (let i = 0; i < words.length; i++) {
          const token = i === words.length - 1 ? words[i] : words[i] + ' ';
          controller.enqueue(encoder.encode(sseEvent('token', { token })));
        }

        controller.enqueue(encoder.encode(sseEvent('agent_status', {
          agent: 'synthesizer',
          message: 'Done',
          done: true,
        })));

        controller.enqueue(encoder.encode(sseEvent('done', {
          conversationId: data.conversationId ?? conversationId ?? null,
          followUpQuestions,
        })));

        controller.close();
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Stream failed';
        controller.enqueue(encoder.encode(sseEvent('error', { message: msg })));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
