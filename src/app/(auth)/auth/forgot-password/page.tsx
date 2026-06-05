'use client';

import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiService } from '../../../../services/apiService';
import { AuthInput, AuthButton, AuthErrorMessage } from '../../../../components/auth';
import { MailIcon } from '../../../../components/icons';

export default function ForgotPasswordPage() {
  useEffect(() => { document.title = "Forgot Password | Maududi's Legacy"; }, []);
  const _router = useRouter();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiService.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <>
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-brand-green/10 dark:bg-brand-green-dark/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-brand-green dark:text-brand-green-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 18v.75c0 .414.336.75.75.75h18a.75.75 0 00.75-.75V18l-7.5-4.5m0 0L21.75 9l-7.5-4.5M2.25 9l7.5-4.5L2.25 9z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Check your email</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            If an account exists for <span className="font-medium text-gray-700 dark:text-gray-300">{email}</span>, you&apos;ll receive a password reset link shortly.
          </p>
        </div>

        <div className="text-center space-y-4">
          <AuthButton variant="secondary" onClick={() => { setSent(false); setEmail(''); }}>
            Send another email
          </AuthButton>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            <Link href="/auth/login" className="font-semibold text-brand-green dark:text-brand-green-dark hover:text-brand-green-light transition-colors">
              Back to sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-8 leading-relaxed">
          Protected by encryption.{' '}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Privacy</Link>
          &nbsp;·&nbsp;
          <Link href="/terms" className="underline underline-offset-2 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Terms</Link>
        </p>
      </>
    );
  }

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Reset your password</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Enter your email and we&apos;ll send you a reset link</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <AuthErrorMessage message={error} />

        <AuthInput
          label="Email"
          icon={<MailIcon className="w-5 h-5" />}
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="you@example.com"
          error={error && !email ? 'Email is required' : undefined}
        />

        <AuthButton loading={loading} type="submit">
          Send reset link
        </AuthButton>
      </form>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-7">
        Remember your password?{' '}
        <Link href="/auth/login" className="font-semibold text-brand-green dark:text-brand-green-dark hover:text-brand-green-light transition-colors">
          Sign in
        </Link>
      </p>

      <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-8 leading-relaxed">
        Protected by encryption.{' '}
        <Link href="/privacy" className="underline underline-offset-2 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Privacy</Link>
        &nbsp;·&nbsp;
        <Link href="/terms" className="underline underline-offset-2 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Terms</Link>
      </p>
    </>
  );
}