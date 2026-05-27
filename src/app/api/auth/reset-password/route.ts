import { NextResponse } from 'next/server';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { getDb } from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    const { token, new_password } = await request.json();

    if (!token || !new_password || new_password.length < 6) {
      return NextResponse.json({ error: 'Valid token and password (min 6 chars) are required' }, { status: 400 });
    }

    const db = await getDb();
    if (!db) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const now = new Date();

    const resetDoc = await db.collection('password_reset_tokens').findOne({
      token_hash: tokenHash,
      used_at: null,
      expires_at: { $gt: now },
    });

    if (!resetDoc) {
      return NextResponse.json({ error: 'Invalid or expired reset token.' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(new_password, 12);

    await db.collection('users').updateOne(
      { id: resetDoc.user_id },
      { $set: { password_hash: passwordHash } },
    );

    await db.collection('password_reset_tokens').updateOne(
      { _id: resetDoc._id },
      { $set: { used_at: now } },
    );

    return NextResponse.json({ message: 'Password has been reset successfully.' });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: `Reset failed: ${message}` }, { status: 500 });
  }
}
