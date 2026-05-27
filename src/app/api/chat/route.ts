import { NextResponse } from 'next/server';
import { callGroq } from '@/lib/groq';

export async function POST(request: Request) {
  try {
    const { aiContext, messages } = await request.json();

    if (!aiContext || !messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'aiContext and messages are required' }, { status: 400 });
    }

    const hasImage = messages.some(m => {
      const content = m.content;
      return Array.isArray(content) && content.some((p: any) => p.type === 'image_url');
    });

    const formattedMessages = [
      { role: 'system', content: aiContext },
      ...messages.map(m => ({
        role: m.role === 'ai' || m.role === 'model' ? 'assistant' : m.role,
        content: m.content,
      })),
    ];

    const model = hasImage ? 'llama-3.2-11b-vision-preview' : 'llama-3.3-70b-versatile';

    const result = await callGroq({
      model,
      messages: formattedMessages,
      temperature: 0.1,
      max_tokens: 4096,
      top_p: 0.9,
    });

    return NextResponse.json({ response: result.response });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: `Chat failed: ${message}` }, { status: 500 });
  }
}
