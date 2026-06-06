import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { getJwtSecret } from './jwt';

const COOKIE_NAME = 'auth_token';

export function getUserIdFromRequest(request: Request): number | null {
  let token: string | null = null;

  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  }

  if (!token) {
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]*)`));
      if (match) token = decodeURIComponent(match[1]);
    }
  }

  if (!token) return null;

  try {
    const payload = jwt.verify(token, getJwtSecret()) as { sub: string };
    return parseInt(payload.sub, 10);
  } catch {
    return null;
  }
}

function setCookie(res: NextResponse, token: string, maxAge: number): void {
  const secure = process.env.VERCEL === '1';
  res.headers.set(
    'Set-Cookie',
    `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax${secure ? '; Secure' : ''}; Max-Age=${maxAge}`,
  );
}

export function setAuthCookie(res: NextResponse, token: string): void {
  setCookie(res, token, 7 * 24 * 60 * 60);
}

export function clearAuthCookie(res: NextResponse): void {
  setCookie(res, '', 0);
}
