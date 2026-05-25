'use client';

import { useState, FormEvent, Suspense } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';

export const dynamic = 'force-dynamic';

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ForgotPasswordContent />
    </Suspense>
  );
}

function ForgotPasswordContent() {
  const { register: _register } = useAuth(); // We'll use auth context for consistency, though we don't need register here
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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api/v1/auth/forgot-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to process request');
      }

      // In dev mode, if token is returned, we could auto-navigate to reset page
      if (data.reset_token) {
        // Dev mode: show token and allow manual reset, or auto-navigate
        setSuccess(`Reset token: ${data.reset_token}`);
        // Optionally auto-navigate: router.push(`/auth/reset-password?token=${data.reset_token}`);
      } else {
        setSuccess('If that email is registered, a reset link has been sent.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4">
       <div className="w-full max-w-sm card-glass p-8 shadow-lg rounded-2xl">
         <h1 className="text-3xl font-bold gradient-text text-center mb-8">
           Forgot Password
         </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-sm text-green-700 dark:text-green-300">
              {success}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email Address
            </label>
             <input
               id="email"
               type="email"
               value={email}
               onChange={e => setEmail(e.target.value)}
               required
               className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-200"
               placeholder="your@email.com"
             />
          </div>

           <button
             type="submit"
             disabled={loading}
             className="w-full py-3 px-6 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium disabled:opacity-50 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
           >
             {loading ? 'Sending...' : 'Send Reset Link'}
           </button>
        </form>

        <p className="mt-6 text-sm text-center text-gray-500 dark:text-gray-400">
          Remember your password?{' '}
          <Link href="/auth/login" className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
