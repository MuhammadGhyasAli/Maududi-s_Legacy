'use client';

import { useState, FormEvent, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { useToast } from '../../../../components/Toast';
import GoogleSignInButton from '../../../../components/GoogleSignInButton';
import { useDocumentMeta } from '../../../../hooks/useDocumentMeta';

export default function RegisterPage() {
  useDocumentMeta('Create Account');
  const { register, verifyEmail } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const codeInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => setResendTimer(t => t - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [resendTimer]);

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...verificationCode];
    newCode[index] = value.slice(0, 1);
    setVerificationCode(newCode);
    setVerificationError('');
    if (value && index < 5) {
      codeInputsRef.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      codeInputsRef.current[index - 1]?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = [...verificationCode];
    paste.split('').forEach((char, i) => { if (i < 6) newCode[i] = char; });
    setVerificationCode(newCode);
    if (paste.length === 6) {
      codeInputsRef.current[5]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = verificationCode.join('');
    if (code.length !== 6) {
      setVerificationError('Please enter the full 6-digit code');
      return;
    }
    setVerificationLoading(true);
    setVerificationError('');
    try {
      await verifyEmail(code, email);
      toast('Welcome! Your account is ready');
      router.push('/');
    } catch (err) {
      setVerificationError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setVerificationLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0) return;
    setVerificationLoading(true);
    setVerificationError('');
    try {
      await register(email, password, displayName || undefined);
      setResendTimer(60);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend code');
      setShowVerification(false);
    } finally {
      setVerificationLoading(false);
    }
  };

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
      await register(email, password, displayName || undefined);
      setShowVerification(true);
      setResendTimer(60);
      setTimeout(() => codeInputsRef.current[0]?.focus(), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Verification view
  if (showVerification) {
    return (
      <div className="space-y-6">
        {verificationError && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/60" role="alert">
            <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-red-600 dark:text-red-400">{verificationError}</div>
          </div>
        )}

        <div className="text-center py-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/25 flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 18v.75c0 .414.336.75.75.75h18a.75.75 0 00.75-.75V18l-7.5-4.5m0 0L21.75 9l-7.5-4.5M2.25 9l7.5-4.5L2.25 9z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Verify your email</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-xs mx-auto">
            We sent a 6-digit code to <span className="font-semibold text-gray-700 dark:text-gray-300">{email}</span>. Check your inbox.
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-center text-gray-700 dark:text-gray-300 mb-4">
            Enter verification code
          </label>
          <div className="flex justify-center gap-2.5" onPaste={handleCodePaste} role="group" aria-label="Enter 6-digit verification code">
            {verificationCode.map((digit, i) => (
              <input
                key={i}
                ref={el => { codeInputsRef.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleCodeChange(i, e.target.value)}
                onKeyDown={e => handleCodeKeyDown(i, e)}
                className="w-12 h-[3.25rem] text-center text-xl font-bold rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-brand-bg-dark text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-green/30 transition-all duration-200"
                aria-label={`Digit ${i + 1}`}
              />
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleVerify}
          disabled={verificationLoading || verificationCode.join('').length !== 6}
          className="w-full py-3 rounded-xl text-white font-semibold text-sm bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 active:scale-[0.98] shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
        >
          {verificationLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Verifying...
            </span>
          ) : (
            'Verify email'
          )}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={handleResendCode}
            disabled={resendTimer > 0 || verificationLoading}
            className="text-sm font-medium text-brand-green dark:text-brand-green-dark hover:text-brand-green-light disabled:text-gray-400 dark:disabled:text-gray-600 transition-colors cursor-pointer"
          >
            {resendTimer > 0 ? (
              <span>Resend code in <span className="font-semibold">{resendTimer}s</span></span>
            ) : (
              'Resend code'
            )}
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 pt-4 border-t border-gray-100 dark:border-gray-800">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-semibold text-brand-green dark:text-brand-green-dark hover:text-brand-green-light transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    );
  }

  // Registration view
  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-[1.75rem] font-bold text-gray-900 dark:text-gray-100 tracking-tight">
          Create account
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Join to explore the works of Maududi
        </p>
      </div>

      {/* Google Sign Up */}
      <div className="mb-6">
        <GoogleSignInButton mode="signup" />
      </div>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-700" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 bg-white dark:bg-brand-card-dark">
            Or sign up with email
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/60" role="alert">
            <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
          </div>
        )}

        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Full name <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="Your full name"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-brand-bg-dark text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green text-sm transition-all duration-200"
          />
        </div>

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
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="Create a strong password"
              className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-brand-bg-dark text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green text-sm transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>
          {password && (
            <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <svg className={`w-3.5 h-3.5 ${password.length >= 6 ? 'text-brand-green' : 'text-amber-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={password.length >= 6 ? "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" : "M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"} />
              </svg>
              <span className={password.length >= 6 ? 'text-brand-green' : 'text-amber-600 dark:text-amber-400'}>{password.length >= 6 ? 'Strong enough' : 'Minimum 6 characters'}</span>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Confirm password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="Repeat your password"
              className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-brand-bg-dark text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green text-sm transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
              tabIndex={-1}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>
          {confirmPassword && password !== confirmPassword && (
            <p className="mt-1.5 text-xs text-red-500">Passwords do not match</p>
          )}
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
              Creating account...
            </span>
          ) : (
            'Create account'
          )}
        </button>

        <p className="text-center text-xs text-gray-400 dark:text-gray-500">
          By creating an account, you agree to our{' '}
          <Link href="/terms" className="underline underline-offset-2 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Terms</Link>
          &nbsp;and&nbsp;
          <Link href="/privacy" className="underline underline-offset-2 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Privacy Policy</Link>
        </p>
      </form>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
        Already have an account?{' '}
        <Link href="/auth/login" className="font-semibold text-brand-green dark:text-brand-green-dark hover:text-brand-green-light transition-colors">
          Sign in
        </Link>
      </p>
    </>
  );
}