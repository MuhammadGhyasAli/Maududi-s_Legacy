'use client';

import { useState, FormEvent, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { useToast } from '../../../../components/Toast';
import { AuthInput, AuthButton, AuthErrorMessage, PasswordStrength } from '../../../../components/auth';
import GoogleSignInButton from '../../../../components/GoogleSignInButton';
import { MailIcon, LockIcon, UserIcon } from '../../../../components/icons';

export default function RegisterPage() {
  useEffect(() => { document.title = "Register | Maududi's Legacy"; }, []);
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

  if (showVerification) {
    return (
      <div className="space-y-6">
        <AuthErrorMessage message={verificationError} />

        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-brand-green/10 dark:bg-brand-green-dark/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-brand-green dark:text-brand-green-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 18v.75c0 .414.336.75.75.75h18a.75.75 0 00.75-.75V18l-7.5-4.5m0 0L21.75 9l-7.5-4.5M2.25 9l7.5-4.5L2.25 9z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Check your email</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            We sent a 6-digit code to <span className="font-medium text-gray-700 dark:text-gray-300">{email}</span>
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-center text-gray-600 dark:text-gray-400 mb-4">Verification code</label>
          <div className="flex justify-center gap-2" onPaste={handleCodePaste} role="group" aria-label="Enter 6-digit verification code">
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
                className="w-11 h-12 text-center text-lg font-semibold rounded-lg border-2 bg-white dark:bg-brand-bg-dark text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-brand-green/30 transition-all duration-200
                  {digit ? 'border-brand-green' : 'border-gray-300 dark:border-gray-600'}"
                aria-label={`Digit ${i + 1}`}
              />
            ))}
          </div>
        </div>

        <AuthButton loading={verificationLoading} disabled={verificationCode.join('').length !== 6} onClick={handleVerify}>
          Verify email
        </AuthButton>

        <div className="text-center">
          <button
            type="button"
            onClick={handleResendCode}
            disabled={resendTimer > 0 || verificationLoading}
            className="text-sm font-medium text-brand-green dark:text-brand-green-dark hover:text-brand-green-light disabled:text-gray-400 dark:disabled:text-gray-600 transition-colors cursor-pointer"
          >
            {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend code'}
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-7">
          Already have an account?{' '}
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
      </div>
    );
  }

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create your account</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Join to explore the works of Maududi</p>
      </div>

      <div className="mb-6">
        <GoogleSignInButton mode="signup" />
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-4 bg-white dark:bg-brand-card-dark text-gray-400 dark:text-gray-500 font-medium">Or sign up with email</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <AuthErrorMessage message={error} />

        <AuthInput
          label="Full name"
          icon={<UserIcon className="w-5 h-5" />}
          type="text"
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
          placeholder="Your full name"
          hint="Optional"
        />

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
          minLength={6}
          autoComplete="new-password"
          placeholder="At least 6 characters"
          showPasswordToggle
          error={error && !password ? 'Password is required' : undefined}
        />

        <PasswordStrength password={password} show={!!password} />

        <AuthInput
          label="Confirm password"
          icon={<LockIcon className="w-5 h-5" />}
          type="password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
          minLength={6}
          autoComplete="new-password"
          placeholder="Repeat your password"
          showPasswordToggle
          error={confirmPassword && password !== confirmPassword ? 'Passwords do not match' : undefined}
        />

        <AuthButton loading={loading} type="submit">
          Create account
        </AuthButton>
      </form>

      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-7">
        Already have an account?{' '}
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