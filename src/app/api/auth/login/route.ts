import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET_KEY || 'your_jwt_secret_key_here_change_in_production';
const JWT_EXPIRATION_MINUTES = parseInt(process.env.JWT_EXPIRATION_MINUTES || '1440', 10);

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

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ detail: 'Invalid email or password' }, { status: 401 });
    }

    const expiresIn = JWT_EXPIRATION_MINUTES * 60;
    const accessToken = jwt.sign(
      { sub: String(user.id), username: user.username },
      JWT_SECRET,
      { expiresIn },
    );

    return NextResponse.json({ access_token: accessToken, token_type: 'bearer', expires_in: expiresIn });
  } catch {
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}
