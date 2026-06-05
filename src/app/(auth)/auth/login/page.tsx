'use client';

import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { AuthInput, AuthButton, AuthErrorMessage } from '../../../../components/auth';
import GoogleSignInButton from '../../../../components/GoogleSignInButton';
import { MailIcon, LockIcon } from '../../../../components/icons';

export default function LoginPage() {
  useEffect(() => { document.title = "Login | Maududi's Legacy"; }, []);
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
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Welcome back</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Sign in to continue to Maududi&apos;s Legacy</p>
      </div>

      <div className="mb-6">
        <GoogleSignInButton mode="signin" />
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-4 bg-white dark:bg-brand-card-dark text-gray-400 dark:text-gray-500 font-medium">Or continue with email</span>
          </div>
        </div>
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

        <AuthInput
          label="Password"
          icon={<LockIcon className="w-5 h-5" />}
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          placeholder="Enter your password"
          showPasswordToggle
          error={error && !password ? 'Password is required' : undefined}
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 text-brand-green focus:ring-brand-green/30 focus:ring-2"
              aria-label="Remember me"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">Remember me</span>
          </label>
          <Link href="/auth/forgot-password" className="text-sm font-medium text-brand-green dark:text-brand-green-dark hover:text-brand-green-light transition-colors">
            Forgot password?
          </Link>
        </div>

        <AuthButton loading={loading} type="submit">
          Sign in
        </AuthButton>
      </form>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-7">
        Don&apos;t have an account?{' '}
        <Link href="/auth/register" className="font-semibold text-brand-green dark:text-brand-green-dark hover:text-brand-green-light transition-colors">
          Create one
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