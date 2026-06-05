'use client';

import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import GoogleSignInButton from '../../../../components/GoogleSignInButton';

export default function LoginPage() {
  useEffect(() => { document.title = "Sign In | Maududi's Legacy"; }, []);
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-[1.75rem] font-bold text-gray-900 dark:text-gray-100 tracking-tight">
          Welcome back
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Sign in to continue your journey
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 mb-6 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/60" role="alert">
          <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
        </div>
      )}

      {/* Google Sign In */}
      <div className="mb-6">
        <GoogleSignInButton mode="signin" />
      </div>

      {/* Divider */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-700" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 bg-white dark:bg-brand-card-dark">
            Or continue with email
          </span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-brand-bg-dark text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green text-sm transition-all duration-200"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-xs font-medium text-brand-green dark:text-brand-green-dark hover:text-brand-green-light transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            placeholder="Enter your password"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-brand-bg-dark text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green text-sm transition-all duration-200"
          />
        </div>

        <div className="flex items-center">
          <input
            id="remember"
            type="checkbox"
            className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-brand-green focus:ring-brand-green/30 focus:ring-2"
          />
          <label htmlFor="remember" className="ml-2.5 text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none">
            Remember this device
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl text-white font-semibold text-sm bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 active:scale-[0.98] shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/35 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Signing in...
            </span>
          ) : (
            'Sign in'
          )}
        </button>
      </form>

      {/* Sign up link */}
      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
        Don&apos;t have an account?{' '}
        <Link href="/auth/register" className="font-semibold text-brand-green dark:text-brand-green-dark hover:text-brand-green-light transition-colors">
          Create account
        </Link>
      </p>

      {/* Footer */}
      <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-8 leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-6">
        Protected by encryption.{' '}
        <Link href="/privacy" className="underline underline-offset-2 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Privacy Policy</Link>
        &nbsp;·&nbsp;
        <Link href="/terms" className="underline underline-offset-2 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Terms of Service</Link>
      </p>
    </>
  );
}