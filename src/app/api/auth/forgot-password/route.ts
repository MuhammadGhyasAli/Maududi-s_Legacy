import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const PA_API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://syedghyas.pythonanywhere.com';
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

    // Call PA backend to create reset token
    const paRes = await fetch(`${PA_API_BASE}/api/v1/auth/forgot-password?return_token=true`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim() }),
    });

    const paData = await paRes.json();

    if (!paRes.ok) {
      return NextResponse.json({ error: paData.detail || 'Failed to create reset token' }, { status: 502 });
    }

    if (!paData.reset_token) {
      return NextResponse.json({ message: 'If that email is registered, a reset link has been sent.' });
    }

    // Send email
    const resetLink = `${RESET_PASSWORD_URL}?token=${paData.reset_token}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD,
      },
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
