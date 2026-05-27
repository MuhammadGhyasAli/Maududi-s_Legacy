import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb, getNextId } from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET_KEY || 'your_jwt_secret_key_here_change_in_production';
const JWT_EXPIRATION_MINUTES = parseInt(process.env.JWT_EXPIRATION_MINUTES || '1440', 10);
const GOOGLE_CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID || '';

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

export async function POST(request: Request) {
  try {
    const { id_token } = await request.json();
    if (!id_token) {
      return NextResponse.json({ detail: 'id_token is required' }, { status: 400 });
    }

    if (!GOOGLE_CLIENT_ID) {
      return NextResponse.json({ detail: 'Google OAuth is not configured' }, { status: 500 });
    }

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: id_token,
        audience: GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid Google token';
      return NextResponse.json({ detail: `Google token verification error: ${message}` }, { status: 401 });
    }

    if (!payload) {
      return NextResponse.json({ detail: 'Could not verify Google token' }, { status: 401 });
    }

    const googleId = payload.sub;
    const email = payload.email || '';
    const name = payload.name || (email ? email.split('@')[0] : 'User');

    const db = await getDb();
    if (!db) {
      return NextResponse.json({ detail: 'Service unavailable' }, { status: 503 });
    }

    let user = await db.collection('users').findOne({ google_id: googleId });

    if (!user) {
      if (email) {
        user = await db.collection('users').findOne({ email });
        if (user) {
          await db.collection('users').updateOne(
            { id: user.id },
            { $set: { google_id: googleId, display_name: name } },
          );
          user.google_id = googleId;
          user.display_name = name;
        }
      }

      if (!user) {
        let username = email ? email.split('@')[0] : `user_${googleId.slice(0, 8)}`;
        const baseUsername = username;
        let suffix = 1;
        while (await db.collection('users').findOne({ username })) {
          username = `${baseUsername}${suffix}`;
          suffix++;
        }

        const passwordHash = await bcrypt.hash(
          require('crypto').randomBytes(32).toString('hex'),
          12,
        );
        const id = await getNextId(db, 'users');

        user = {
          id,
          username,
          email,
          display_name: name,
          password_hash: passwordHash,
          google_id: googleId,
          is_active: true,
          is_verified: true,
        };

        await db.collection('users').insertOne(user);
      }
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
