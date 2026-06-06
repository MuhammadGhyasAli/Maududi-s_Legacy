import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/mongodb';
import { getUserIdFromRequest, clearAuthCookie } from '@/lib/auth';

async function getAuthenticatedUser(request: Request, db: any) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return null;
  return db.collection('users').findOne({ id: userId }, { projection: { password_hash: 0 } });
}

export async function GET(request: Request) {
  try {
    const db = await getDb();
    if (!db) return NextResponse.json({ detail: 'Service unavailable' }, { status: 503 });
    const user = await getAuthenticatedUser(request, db);
    if (!user) return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 });
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

export async function PUT(request: Request) {
  try {
    const db = await getDb();
    if (!db) return NextResponse.json({ detail: 'Service unavailable' }, { status: 503 });
    const userId = getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 });
    const { display_name, email } = await request.json();
    const update: Record<string, any> = {};
    if (display_name !== undefined) {
      if (!display_name?.trim() || display_name.trim().length > 100) {
        return NextResponse.json({ detail: 'Display name must be 1-100 characters' }, { status: 400 });
      }
      update.display_name = display_name.trim();
    }
    if (email !== undefined) {
      if (!email?.trim() || !email.includes('@')) {
        return NextResponse.json({ detail: 'Valid email is required' }, { status: 400 });
      }
      const normalizedEmail = email.trim().toLowerCase();
      const existing = await db.collection('users').findOne({ email: normalizedEmail, id: { $ne: userId } });
      if (existing) {
        return NextResponse.json({ detail: 'Email already in use' }, { status: 400 });
      }
      update.email = normalizedEmail;
    }
    if (Object.keys(update).length === 0) {
      return NextResponse.json({ detail: 'No fields to update' }, { status: 400 });
    }
    await db.collection('users').updateOne({ id: userId }, { $set: update });
    const user = await db.collection('users').findOne(
      { id: userId },
      { projection: { password_hash: 0 } },
    );
    return NextResponse.json({
      id: user!.id,
      username: user!.username,
      email: user!.email,
      display_name: user!.display_name || user!.username,
      is_active: user!.is_active,
    });
  } catch {
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const db = await getDb();
    if (!db) return NextResponse.json({ detail: 'Service unavailable' }, { status: 503 });
    const userId = getUserIdFromRequest(request);
    if (!userId) return NextResponse.json({ detail: 'Not authenticated' }, { status: 401 });
    const { password } = await request.json();
    if (!password) {
      return NextResponse.json({ detail: 'Password is required to delete account' }, { status: 400 });
    }
    const user = await db.collection('users').findOne({ id: userId });
    if (!user) {
      return NextResponse.json({ detail: 'User not found' }, { status: 404 });
    }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ detail: 'Incorrect password' }, { status: 401 });
    }
    await db.collection('users').deleteOne({ id: userId });
    const res = NextResponse.json({ message: 'Account deleted successfully' });
    clearAuthCookie(res);
    return res;
  } catch {
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}
