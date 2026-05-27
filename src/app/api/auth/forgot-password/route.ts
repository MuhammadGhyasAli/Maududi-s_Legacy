import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { getDb, getNextId } from '@/lib/mongodb';

const GMAIL_USER = process.env.GMAIL_USER || 'ghyasnaqvi05@gmail.com';
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || '';
const RESET_PASSWORD_URL = process.env.RESET_PASSWORD_URL || 'https://maududi-legacy.vercel.app/auth/reset-password';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    if (!GMAIL_APP_PASSWORD) {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    const db = await getDb();
    if (!db) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    const user = await db.collection('users').findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return NextResponse.json({ message: 'If that email is registered, a reset link has been sent.' });
    }

    const token = crypto.randomBytes(32).toString('base64url');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    const id = await getNextId(db, 'password_reset_tokens');

    await db.collection('password_reset_tokens').insertOne({
      id,
      user_id: user.id,
      token_hash: tokenHash,
      expires_at: expiresAt,
      used_at: null,
    });

    const resetLink = `${RESET_PASSWORD_URL}?token=${token}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
    });

    await transporter.sendMail({
      from: `"Maududi's Legacy" <${GMAIL_USER}>`,
      to: email.trim(),
      subject: 'Reset Your Password',
      text: `You requested a password reset for your account.\n\nClick the link below to reset your password:\n${resetLink}\n\nThis link will expire in 30 minutes.\n\nIf you did not request this, please ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #059669;">Password Reset</h2>
          <p>You requested a password reset for your account.</p>
          <p>
            <a href="${resetLink}" 
               style="display: inline-block; padding: 12px 24px; background: #059669; color: white; 
                      text-decoration: none; border-radius: 8px; font-weight: bold;">
              Reset Password
            </a>
          </p>
          <p style="color: #6b7280; font-size: 14px;">
            This link will expire in 30 minutes.<br>
            If you did not request this, please ignore this email.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ message: 'If that email is registered, a reset link has been sent.' });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: `Failed to send email: ${message}` }, { status: 500 });
  }
}
