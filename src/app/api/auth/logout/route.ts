import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth';

export async function POST(request: Request) {
  const res = NextResponse.json({ message: 'Logged out successfully' });
  clearAuthCookie(res, request);
  return res;
}
