import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getDb } from '@/lib/mongodb';
import { getJwtSecret, getJwtExpirationSeconds } from '@/lib/jwt';

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email?.trim() || !code?.trim()) {
      return NextResponse.json({ detail: 'Email and verification code are required' }, { status: 400 });
    }

    const db = await getDb();
    if (!db) {
      return NextResponse.json({ detail: 'Service unavailable' }, { status: 503 });
    }

    const user = await db.collection('users').findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return NextResponse.json({ detail: 'User not found' }, { status: 404 });
    }

    if (user.is_verified) {
      return NextResponse.json({ detail: 'Email already verified' }, { status: 400 });
    }

    if (!user.verification_code || !user.verification_expires_at) {
      return NextResponse.json({ detail: 'No verification code found. Please register again.' }, { status: 400 });
    }

    if (String(user.verification_code) !== code.trim()) {
      return NextResponse.json({ detail: 'Invalid verification code' }, { status: 400 });
    }

    if (new Date(user.verification_expires_at) < new Date()) {
      return NextResponse.json({ detail: 'Verification code has expired. Please request a new one.' }, { status: 400 });
    }

    await db.collection('users').updateOne(
      { id: user.id },
      { $set: { is_verified: true }, $unset: { verification_code: '', verification_expires_at: '' } },
    );

    const expiresIn = getJwtExpirationSeconds();
    const accessToken = jwt.sign(
      { sub: String(user.id), username: user.username },
      getJwtSecret(),
      { expiresIn },
    );

    return NextResponse.json({ access_token: accessToken, token_type: 'bearer', expires_in: expiresIn });
  } catch {
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}
