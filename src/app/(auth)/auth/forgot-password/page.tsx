'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { apiService } from '../../../../services/apiService';
import { useDocumentMeta } from '../../../../hooks/useDocumentMeta';

export default function ForgotPasswordPage() {
  useDocumentMeta('Forgot Password');
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
        <div className="text-center py-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-green flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 18v.75c0 .414.336.75.75.75h18a.75.75 0 00.75-.75V18l-7.5-4.5m0 0L21.75 9l-7.5-4.5M2.25 9l7.5-4.5L2.25 9z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Check your email</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 leading-relaxed max-w-xs mx-auto">
            If an account exists for <span className="font-semibold text-gray-700 dark:text-gray-300">{email}</span>, you&apos;ll receive a password reset link shortly.
          </p>
        </div>

        <div className="space-y-3 mt-6">
          <button
            type="button"
            onClick={() => { setSent(false); setEmail(''); }}
            className="w-full py-3 rounded-lg text-sm font-semibold text-brand-green dark:text-brand-green-dark bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-colors duration-200 cursor-pointer"
          >
            Send another email
          </button>
          <Link
            href="/auth/login"
            className="block w-full text-center py-3 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            Back to sign in
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-[1.75rem] font-bold text-gray-900 dark:text-gray-100 tracking-tight">
          Forgot password?
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          No worries. Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/60" role="alert">
            <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="name@example.com"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-brand-bg-dark text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-brand-green/40 focus:border-brand-green text-sm transition-all duration-200"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg text-white font-semibold text-sm bg-brand-green hover:bg-brand-green-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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

      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-7">
        Remember your password?{' '}
        <Link href="/auth/login" className="font-semibold text-brand-green dark:text-brand-green-dark hover:text-brand-green-light transition-colors">
          Sign in
        </Link>
      </p>
    </>
  );
}