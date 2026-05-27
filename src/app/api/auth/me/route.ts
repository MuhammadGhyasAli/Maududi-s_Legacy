import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getDb } from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET_KEY || 'your_jwt_secret_key_here_change_in_production';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 });
    }

    const token = authHeader.slice(7);
    let payload: { sub: string; username: string };
    try {
      payload = jwt.verify(token, JWT_SECRET) as { sub: string; username: string };
    } catch {
      return NextResponse.json({ detail: 'Invalid or expired token' }, { status: 401 });
    }

    const db = await getDb();
    if (!db) {
      return NextResponse.json({ detail: 'Service unavailable' }, { status: 503 });
    }

    const user = await db.collection('users').findOne(
      { id: parseInt(payload.sub, 10) },
      { projection: { password_hash: 0 } },
    );

    if (!user) {
      return NextResponse.json({ detail: 'User not found' }, { status: 401 });
    }

    return NextResponse.json({
      id: user.id,
      username: user.username,
      email: user.email,
      display_name: user.display_name || user.username,
      is_active: user.is_active,
    });
  } catch {
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}
