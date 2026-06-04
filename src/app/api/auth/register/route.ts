import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb, getNextId } from '@/lib/mongodb';
import { isDisposableEmail } from '@/utils/disposableEmails';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, display_name } = body;
    let username = body.username;

    if (!email?.trim() || !email.includes('@')) {
      return NextResponse.json({ detail: 'Valid email is required' }, { status: 400 });
    }
    if (isDisposableEmail(email.trim())) {
      return NextResponse.json({ detail: 'Temporary email addresses are not allowed. Please use a permanent email address.' }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ detail: 'Password must be at least 6 characters' }, { status: 400 });
    }

    username = username?.trim() || email.split('@')[0];

    const db = await getDb();
    if (!db) {
      return NextResponse.json({ detail: 'Service unavailable' }, { status: 503 });
    }

    const existingEmail = await db.collection('users').findOne({ email: email.trim().toLowerCase() });
    if (existingEmail) {
      return NextResponse.json({ detail: 'Email already registered' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const id = await getNextId(db, 'users');

    const user = {
      id,
      username,
      email: email.trim().toLowerCase(),
      display_name: display_name?.trim() || email.split('@')[0],
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
