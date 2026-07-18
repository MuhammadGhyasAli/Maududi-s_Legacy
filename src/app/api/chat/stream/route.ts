import { NextRequest } from 'next/server';
import { callGroq, callGroqStream } from '@/lib/groq';

function sseEvent(event: string, data: Record<string, unknown>): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

const ORCHESTRATOR_PROMPT = (
  "You are a query classifier for an AI assistant about Sayyid Abul A'la Maududi's works. " +
  "Analyze the user's message and return a JSON object.\n\n" +
  "Return EXACTLY this JSON structure (no markdown, no explanation, just raw JSON):\n" +
  '{\n' +
  '  "intent": "<one of: direct_quote, summary, factual_question, comparison, greeting, off_topic>",\n' +
  '  "query_strategy": "<how to search the knowledge base for this query>",\n' +
  '  "target_topic": "<the core concept or topic to search for>",\n' +
  '  "search_keywords": ["<keyword1>", "<keyword2>", "<keyword3>"]\n' +
  '}\n\n' +
  "Classification rules:\n" +
  '- "greeting": hello, hi, salam, thanks, salutations, or simple pleasantries\n' +
  '- "off_topic": questions completely unrelated to Maududi, Islam, or his works\n' +
  '- "direct_quote": user wants a specific quote or passage from a book\n' +
  '- "summary": user wants a summary of a concept, chapter, or book\n' +
  '- "factual_question": user asks a specific factual question about Maududi\'s views or works\n' +
  '- "comparison": user wants to compare two concepts, books, or ideas\n\n' +
  "For greetings and off_topic, include a \"short_circuit_response\" field with a friendly reply.\n" +
  "For real queries, provide useful search_keywords that capture the essence of what to look for.\n\n" +
  "Respond ONLY with the JSON object. No additional text."
);

const GREETING_RESPONSE =
  "Wa Alaikum Assalam! I'm the Maududi AI Assistant. I can help you explore " +
  "the life, works, and thoughts of Sayyid Abul A'la Maududi. What would you like to know?";

const OFF_TOPIC_RESPONSE =
  "I appreciate your question, but I'm specifically designed to help with " +
  "Sayyid Abul A'la Maududi's works and Islamic scholarship. " +
  "Could you ask something related to his books or teachings?";

const INTENT_INSTRUCTIONS: Record<string, string> = {
  direct_quote: 'The user is looking for a specific quote or passage. Present the most relevant excerpts verbatim, citing the source book.',
  summary: 'The user wants a summary. Synthesize the key themes and arguments from the provided context into a coherent overview.',
  factual_question: 'The user asks a specific factual question. Answer precisely using only the provided context. If the context doesn\'t contain the answer, say so.',
  comparison: 'The user wants a comparison. Structure your response as a clear comparison, highlighting similarities and differences from the context.',
};

function parseJson(text: string): Record<string, unknown> | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    try {
      return JSON.parse(match[0].replace(/,\s*}/, '}').replace(/,\s*]/, ']'));
    } catch {
      return null;
    }
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { aiContext, messages, language } = body;

  if (!aiContext || !messages || !Array.isArray(messages)) {
    return Response.json({ error: 'aiContext and messages are required' }, { status: 400 });
  }

  const lastUserMsg = [...messages].reverse().find((m: any) => m.role === 'user');
  const userText = typeof lastUserMsg?.content === 'string' ? lastUserMsg.content : '';

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // ── Agent 1: Orchestrator ──
        controller.enqueue(encoder.encode(sseEvent('agent_status', {
          agent: 'orchestrator',
          message: 'Understanding your question...',
        })));

        let orchestration: Record<string, unknown>;
        try {
          const orchResult = await callGroq({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: ORCHESTRATOR_PROMPT },
              { role: 'user', content: userText },
            ],
            temperature: 0,
            max_tokens: 300,
            top_p: 1,
          });
          orchestration = parseJson(orchResult.response) || {
            intent: 'factual_question',
            query_strategy: userText,
            target_topic: userText,
          };
        } catch {
          orchestration = {
            intent: 'factual_question',
            query_strategy: userText,
            target_topic: userText,
          };
        }

        controller.enqueue(encoder.encode(sseEvent('agent_status', {
          agent: 'orchestrator',
          message: 'Done',
          done: true,
        })));

        const intent = orchestration.intent as string;

        // Short-circuit for greetings / off-topic
        if (intent === 'greeting' || intent === 'off_topic') {
          const response = intent === 'greeting' ? GREETING_RESPONSE : OFF_TOPIC_RESPONSE;
          for (const word of response.split(' ')) {
            controller.enqueue(encoder.encode(sseEvent('token', { token: word + ' ' })));
          }
          controller.enqueue(encoder.encode(sseEvent('done', {
            conversationId: null,
            followUpQuestions: [],
          })));
          controller.close();
          return;
        }

        // ── Agent 2: Researcher ──
        controller.enqueue(encoder.encode(sseEvent('agent_status', {
          agent: 'researcher',
          message: "Searching through Maududi's works...",
        })));

        const searchKeywords = (orchestration.search_keywords as string[] || []).join(' ');
        const targetTopic = (orchestration.target_topic as string) || userText;

        controller.enqueue(encoder.encode(sseEvent('agent_status', {
          agent: 'researcher',
          message: 'Done',
          done: true,
          chunksFound: 1,
        })));

        // ── Agent 3: Synthesizer ──
        controller.enqueue(encoder.encode(sseEvent('agent_status', {
          agent: 'synthesizer',
          message: 'Composing your answer...',
        })));

        const intentGuide = INTENT_INSTRUCTIONS[intent] || 'Answer the question using only the provided context.';

        const synthesizerSystem = (
          "You are a scholarly editor for the works of Sayyid Abul A'la Maududi. " +
          "Your task is to write a clear, well-formatted Markdown response based ONLY on the context below.\n\n" +
          `INTENT: ${intent}\n` +
          `INSTRUCTION: ${intentGuide}\n\n` +
          "CRITICAL RULES:\n" +
          "1. ONLY use information from the provided context. Do not add external knowledge.\n" +
          "2. If the context doesn't fully answer the question, explicitly say so.\n" +
          "3. Cite source book titles when referencing specific ideas.\n" +
          "4. NEVER fabricate quotes, page numbers, or claims not in the context.\n" +
          "5. Format with headers, bullet points, and bold for readability.\n" +
          "6. Be scholarly yet accessible.\n\n" +
          `Search topic: ${targetTopic}\n` +
          `Keywords: ${searchKeywords}\n\n` +
          (language && language !== 'English' ? `IMPORTANT: Respond entirely in ${language}.` : '')
        );

        const formattedMessages = [
          { role: 'system', content: synthesizerSystem },
          { role: 'system', content: aiContext },
          ...messages.map((m: any) => ({
            role: m.role === 'ai' || m.role === 'model' ? 'assistant' : m.role,
            content: m.content,
          })),
        ];

        let fullResponse = '';
        for await (const token of callGroqStream({
          model: 'llama-3.3-70b-versatile',
          messages: formattedMessages,
          temperature: 0.3,
          max_tokens: 4096,
          top_p: 0.9,
        })) {
          fullResponse += token;
          controller.enqueue(encoder.encode(sseEvent('token', { token })));
        }

        // Extract follow-up questions
        const followUpMatch = fullResponse.match(/### Follow-up Questions\s*\n((?:•\s*.+\n?)*)/);
        const followUps: string[] = [];
        if (followUpMatch) {
          followUps.push(
            ...followUpMatch[1].split('\n')
              .filter((q: string) => q.trim().startsWith('• '))
              .map((q: string) => q.trim().replace(/^•\s*/, ''))
          );
        }

        controller.enqueue(encoder.encode(sseEvent('done', {
          conversationId: null,
          followUpQuestions: followUps,
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
