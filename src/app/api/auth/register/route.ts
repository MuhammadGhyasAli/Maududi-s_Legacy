import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb, getNextId } from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    const { username, email, password, display_name } = await request.json();

    if (!username?.trim() || username.trim().length < 3 || username.trim().length > 50) {
      return NextResponse.json({ detail: 'Username must be 3-50 characters' }, { status: 400 });
    }
    if (!email?.trim() || !email.includes('@')) {
      return NextResponse.json({ detail: 'Valid email is required' }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ detail: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const db = await getDb();
    if (!db) {
      return NextResponse.json({ detail: 'Service unavailable' }, { status: 503 });
    }

    const existingUser = await db.collection('users').findOne({ username: username.trim() });
    if (existingUser) {
      return NextResponse.json({ detail: 'Username already taken' }, { status: 400 });
    }

    const existingEmail = await db.collection('users').findOne({ email: email.trim().toLowerCase() });
    if (existingEmail) {
      return NextResponse.json({ detail: 'Email already registered' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const id = await getNextId(db, 'users');

    const user = {
      id,
      username: username.trim(),
      email: email.trim().toLowerCase(),
      display_name: display_name?.trim() || username.trim(),
      password_hash: passwordHash,
      google_id: null,
      is_active: true,
      is_verified: false,
    };

    await db.collection('users').insertOne(user);

    return NextResponse.json({
      id: user.id,
      username: user.username,
      email: user.email,
      display_name: user.display_name,
      is_active: user.is_active,
    }, { status: 201 });
  } catch {
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}
