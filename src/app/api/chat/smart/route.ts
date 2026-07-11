import { NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth';
import { callGroq } from '@/lib/groq';

const BASE_SYSTEM = `You are "Maududi AI Assistant", a friendly, conversational AI assistant specializing in the life, thought, and literary works of Sayyid Abul A'la Maududi.

Your role:
- Help users understand Maududi's books, philosophy, biography, and teachings in a clear, ChatGPT-like manner.
- Be accurate. Base answers on Maududi's established works and well-documented biography. Never fabricate quotes, page numbers, book titles, or historical claims. If you are unsure, say so honestly.
- When relevant, reference specific books by their exact titles.
- Structure longer answers with headings, lists, or bold emphasis for readability. Use markdown.

Language policy:
- Detect the language of the user's latest message and reply in that SAME language, matching its script and tone.
- Supported languages include English, Urdu, Arabic, Persian, Turkish, and Bengali.
- If the user writes in a mix, reply in the dominant language.`;

function buildSystemInstruction(languageMode?: string): string {
  const mode = (languageMode || 'Auto').trim();
  if (!mode || mode === 'Auto') return BASE_SYSTEM;
  return `${BASE_SYSTEM}\n\nIMPORTANT: Regardless of the user's message language, you MUST respond entirely in ${mode}.`;
}

export async function POST(request: Request) {
  try {
    if (!getUserIdFromRequest(request)) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { messages, languageMode } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'messages are required' }, { status: 400 });
    }

    const hasImage = messages.some((m: any) => {
      const content = m.content;
      return Array.isArray(content) && content.some((p: any) => p.type === 'image_url');
    });

    const formattedMessages = [
      { role: 'system' as const, content: buildSystemInstruction(languageMode) },
      ...messages.map((m: any) => ({
        role: m.role === 'ai' || m.role === 'model' ? 'assistant' as const : (m.role as string),
        content: m.content,
      })),
    ];

    const result = await callGroq({
      model: hasImage ? 'llama-3.2-11b-vision-preview' : 'llama-3.3-70b-versatile',
      messages: formattedMessages,
      temperature: 0.3,
      max_tokens: 4096,
      top_p: 0.9,
    });

    return NextResponse.json({ response: result.response });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: `Smart chat failed: ${message}` }, { status: 500 });
  }
}
