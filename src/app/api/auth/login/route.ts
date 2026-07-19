import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '@/lib/mongodb';
import { getJwtSecret, getJwtExpirationSeconds } from '@/lib/jwt';
import { setAuthCookie } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email?.trim() || !password) {
      return NextResponse.json({ detail: 'Email and password are required' }, { status: 400 });
    }

    const db = await getDb();
    if (!db) {
      return NextResponse.json({ detail: 'Service unavailable' }, { status: 503 });
    }

    const user = await db.collection('users').findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return NextResponse.json({ detail: 'Invalid email or password' }, { status: 401 });
    }

    if (!user.is_verified) {
      return NextResponse.json({ detail: 'Please verify your email first. A verification code was sent to your email.' }, { status: 403 });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ detail: 'Invalid email or password' }, { status: 401 });
    }

    const expiresIn = getJwtExpirationSeconds();
    const accessToken = jwt.sign(
      { sub: String(user.id), username: user.username },
      getJwtSecret(),
      { expiresIn },
    );

    const res = NextResponse.json({ access_token: accessToken, token_type: 'bearer', expires_in: expiresIn });
    setAuthCookie(res, accessToken, request);
    return res;
  } catch {
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}
