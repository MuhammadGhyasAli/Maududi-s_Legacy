import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { getDb, getNextId } from '@/lib/mongodb';
import { isDisposableEmail } from '@/utils/disposableEmails';

const GMAIL_USER = process.env.GMAIL_USER || 'ghyasnaqvi05@gmail.com';
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD || '';

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
      if (existingEmail.is_verified) {
        return NextResponse.json({ detail: 'Email already registered' }, { status: 400 });
      }
      await db.collection('users').deleteOne({ id: existingEmail.id });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const id = await getNextId(db, 'users');

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const user = {
      id,
      username,
      email: email.trim().toLowerCase(),
      display_name: display_name?.trim() || email.split('@')[0],
      password_hash: passwordHash,
      google_id: null,
      is_active: true,
      is_verified: false,
      verification_code: verificationCode,
      verification_expires_at: verificationExpiresAt,
    };

    await db.collection('users').insertOne(user);

    if (GMAIL_APP_PASSWORD) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
      });

      await transporter.sendMail({
        from: `"Maududi's Legacy" <${GMAIL_USER}>`,
        to: email.trim(),
        subject: 'Verify your email address',
        text: `Welcome to Maududi's Legacy!\n\nYour verification code is: ${verificationCode}\n\nThis code will expire in 15 minutes.\n\nIf you did not create this account, please ignore this email.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
            <h2 style="color: #059669;">Welcome to Maududi's Legacy</h2>
            <p>Your verification code is:</p>
            <div style="text-align: center; margin: 24px 0;">
              <span style="display: inline-block; padding: 16px 32px; background: #f0fdf4; border: 2px dashed #059669; border-radius: 12px; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #059669;">
                ${verificationCode}
              </span>
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              This code will expire in 15 minutes.<br>
              If you did not create this account, please ignore this email.
            </p>
          </div>
        `,
      });
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      message: 'Verification code sent to your email.',
    }, { status: 201 });
  } catch {
    return NextResponse.json({ detail: 'Server error' }, { status: 500 });
  }
}
