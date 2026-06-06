import { NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth';
import { callGroq } from '@/lib/groq';

export async function POST(request: Request) {
  try {
    if (!getUserIdFromRequest(request)) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const { systemInstruction, messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'messages are required' }, { status: 400 });
    }

    const formattedMessages = [
      ...(systemInstruction ? [{ role: 'system' as const, content: systemInstruction }] : []),
      ...messages.map((m: any) => ({
        role: m.role === 'ai' || m.role === 'model' ? 'assistant' as const : (m.role as string),
        content: m.content,
      })),
    ];

    const result = await callGroq({
      model: 'llama-3.3-70b-versatile',
      messages: formattedMessages,
      temperature: 0.1,
      max_tokens: 4096,
      top_p: 0.9,
    });

    return NextResponse.json({ response: result.response });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: `Global chat failed: ${message}` }, { status: 500 });
  }
}
