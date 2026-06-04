'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // For now, just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-brand-green/10 dark:bg-brand-green-dark/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-brand-green dark:text-brand-green-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 18v.75c0 .414.336.75.75.75h18a.75.75 0 00.75-.75V18l-7.5-4.5m0 0L21.75 9l-7.5-4.5M2.25 9l7.5-4.5L2.25 9z" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Check your email
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
            If an account exists for <span className="font-medium text-gray-700 dark:text-gray-300">{email}</span>, you&apos;ll receive a password reset link shortly.
          </p>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
          <Link href="/auth/login" className="font-semibold text-brand-green dark:text-brand-green-dark hover:text-brand-green-light transition-colors">
            Back to sign in
          </Link>
        </p>
      </>
    );
  }

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Reset your password
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-center gap-2.5 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400" role="alert">
            <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-brand-bg-dark text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green transition-all duration-200"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-lg text-white font-semibold bg-brand-green hover:bg-brand-green-dark active:scale-[0.98] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Sending...
            </span>
          ) : (
            'Send reset link'
          )}
        </button>
      </form>

      <div className="relative my-7">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-700/60" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-3 text-xs text-gray-400 dark:text-gray-500 bg-white dark:bg-brand-card-dark">
            or
          </span>
        </div>
      </div>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
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
