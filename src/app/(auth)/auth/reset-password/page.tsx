'use client';

import { useState, FormEvent, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { apiService } from '../../../../services/apiService';
import { AuthInput, AuthButton, AuthErrorMessage, PasswordStrength } from '../../../../components/auth';
import { LockIcon } from '../../../../components/icons';

function ResetPasswordForm() {
  useEffect(() => { document.title = "Reset Password | Maududi's Legacy"; }, []);
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      if (!token) throw new Error('Missing reset token');
      await apiService.resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Invalid reset link</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">This link is invalid or has expired.</p>
        <Link href="/auth/forgot-password" className="inline-block mt-6 text-sm font-semibold text-brand-green dark:text-brand-green-dark hover:text-brand-green-light transition-colors">
          Request a new reset link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 rounded-full bg-brand-green/10 dark:bg-brand-green-dark/20 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-brand-green dark:text-brand-green-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Password reset successful</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Your password has been updated. You can now sign in with your new password.</p>
        <Link href="/auth/login" className="inline-block mt-6 px-6 py-2.5 rounded-lg text-white font-semibold bg-brand-green hover:bg-brand-green-dark active:scale-[0.98] shadow-sm transition-all duration-200">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Set new password</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Must be at least 6 characters</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <AuthErrorMessage message={error} />

        <AuthInput
          label="New password"
          icon={<LockIcon className="w-5 h-5" />}
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          minLength={6}
          autoComplete="new-password"
          placeholder="At least 6 characters"
          showPasswordToggle
        />

        <PasswordStrength password={password} show={!!password} />

        <AuthInput
          label="Confirm new password"
          icon={<LockIcon className="w-5 h-5" />}
          type="password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
          minLength={6}
          autoComplete="new-password"
          placeholder="Repeat your new password"
          showPasswordToggle
          error={confirmPassword && password !== confirmPassword ? 'Passwords do not match' : undefined}
        />

        <AuthButton loading={loading} type="submit">
          Reset password
        </AuthButton>
      </form>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-7">
        <Link href="/auth/login" className="font-semibold text-brand-green dark:text-brand-green-dark hover:text-brand-green-light transition-colors">
          Back to sign in
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-32" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}