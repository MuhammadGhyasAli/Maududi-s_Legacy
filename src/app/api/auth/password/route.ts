import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/mongodb';
import { getUserIdFromRequest } from '@/lib/auth';

export async function PUT(request: Request) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 });

    const { current_password, new_password } = await request.json();

    if (!current_password) {
      return NextResponse.json({ detail: 'Current password is required' }, { status: 400 });
    }
    if (!new_password || new_password.length < 6) {
      return NextResponse.json({ detail: 'New password must be at least 6 characters' }, { status: 400 });
    }

    const db = await getDb();
    if (!db) {
      return NextResponse.json({ detail: 'Service unavailable' }, { status: 503 });
    }

    const user = await db.collection('users').findOne({ id: userId });
    if (!user) {
      return NextResponse.json({ detail: 'User not found' }, { status: 404 });
    }

    const valid = await bcrypt.compare(current_password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ detail: 'Current password is incorrect' }, { status: 401 });
    }

    const passwordHash = await bcrypt.hash(new_password, 12);
    await db.collection('users').updateOne({ id: userId }, { $set: { password_hash: passwordHash } });

    return NextResponse.json({ message: 'Password changed successfully' });
  } catch {
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}
