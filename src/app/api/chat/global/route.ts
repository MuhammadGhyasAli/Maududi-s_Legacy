import { NextResponse } from 'next/server';

const GROQ_API_BASE = 'https://api.groq.com/openai/v1';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

export async function POST(request: Request) {
  try {
    const { systemInstruction, messages } = await request.json();

    if (!GROQ_API_KEY) {
      return NextResponse.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 });
    }

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

    const groqRes = await fetch(`${GROQ_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: formattedMessages,
        temperature: 0.1,
        max_tokens: 4096,
        top_p: 0.9,
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      return NextResponse.json({ error: `Groq API error: ${groqRes.status} ${errText}` }, { status: 502 });
    }

    const data = await groqRes.json();
    return NextResponse.json({ response: data.choices[0].message.content });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: `Global chat failed: ${message}` }, { status: 500 });
  }
}
