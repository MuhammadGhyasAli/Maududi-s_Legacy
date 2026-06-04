'use client';

import { useState, FormEvent, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export const dynamic = 'force-dynamic';

function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.detail || 'Failed to process request');
      }

      setSuccess(data.message || 'If that email is registered, a reset link has been sent.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12
                      bg-gradient-to-b from-emerald-50/50 via-white to-white
                      dark:from-brand-bg-dark dark:via-brand-bg-dark dark:to-brand-bg-dark">
      <div className="fixed top-1/4 -left-32 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 -right-32 w-96 h-96 bg-brand-green/10 dark:bg-brand-green/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md animate-fade-in-up">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <Image
              src="/logo.png"
              alt="Maududi's Legacy"
              width={160}
              height={40}
              className="h-10 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        <div className="relative bg-white dark:bg-brand-card-dark rounded-2xl shadow-xl shadow-emerald-500/5 dark:shadow-black/20 border border-emerald-100/60 dark:border-emerald-900/20 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-brand-green via-brand-blue to-brand-green" />

          <div className="p-8 sm:p-10">
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 dark:text-gray-50 text-center mb-1">
              Forgot password?
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-8">
              Enter your email and we&apos;ll send you a reset link
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 text-sm text-red-700 dark:text-red-300">
                  <svg className="w-5 h-5 mt-0.5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-sm text-emerald-700 dark:text-emerald-300">
                  <svg className="w-5 h-5 mt-0.5 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{success}</span>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-brand-bg-dark text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green outline-none transition-all duration-200"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl text-white font-semibold
                           bg-gradient-brand hover:opacity-90
                           shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30
                           disabled:opacity-50 disabled:cursor-not-allowed
                           transition-all duration-200 cursor-pointer"
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
                  'Send Reset Link'
                )}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-7">
              Remember your password?{' '}
              <Link href="/auth/login" className="font-semibold text-brand-green dark:text-brand-green-dark hover:text-brand-green-light transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-50/50 via-white to-white dark:from-brand-bg-dark dark:via-brand-bg-dark dark:to-brand-bg-dark">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green" />
      </div>
    }>
      <ForgotPasswordForm />
    </Suspense>
  );
}
