import { NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth';
import { callGroq } from '@/lib/groq';

const COOKIE_NAME = 'guest_msg_count';
const MAX_GUEST_MSGS = 10;

function getGuestCount(request: Request): number {
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=(\\d+)`));
  return match ? parseInt(match[1], 10) : 0;
}

function setGuestCountCookie(res: NextResponse, count: number): void {
  const secure = process.env.VERCEL === '1';
  res.headers.set(
    'Set-Cookie',
    `${COOKIE_NAME}=${count}; Path=/; HttpOnly; SameSite=Lax${secure ? '; Secure' : ''}; Max-Age=${30 * 24 * 60 * 60}`,
  );
}

export async function POST(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    const body = await request.json();
    const { aiContext, messages } = body;

    if (!userId) {
      const count = getGuestCount(request);
      if (count >= MAX_GUEST_MSGS) {
        return NextResponse.json({
          error: 'Free limit reached. Please log in to continue chatting.',
          limitReached: true,
        }, { status: 403 });
      }
    }

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

    if (!userId) {
      const newCount = getGuestCount(request) + 1;
      const res = NextResponse.json({
        response: result.response,
        guestMessageCount: newCount,
      });
      setGuestCountCookie(res, newCount);
      return res;
    }

    return NextResponse.json({ response: result.response });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: `Chat failed: ${message}` }, { status: 500 });
  }
}
