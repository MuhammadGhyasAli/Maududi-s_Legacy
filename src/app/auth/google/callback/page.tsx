'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const idToken = params.get('id_token');
    const nonce = params.get('nonce');

    if (nonce) {
      const storedNonce = sessionStorage.getItem('google_nonce');
      if (storedNonce !== nonce) {
        const errMsg = 'Invalid nonce. Please try again.';
        sessionStorage.removeItem('google_nonce');
        if (window.opener) {
          window.opener.postMessage({ type: 'GOOGLE_AUTH', error: errMsg }, window.location.origin);
          window.close();
        } else {
          setError(errMsg);
        }
        return;
      }
      sessionStorage.removeItem('google_nonce');
    }

    if (!idToken) {
      const errMsg = 'No Google ID token received. Please try again.';
      if (window.opener) {
        window.opener.postMessage({ type: 'GOOGLE_AUTH', error: errMsg }, window.location.origin);
        window.close();
      } else {
        setError(errMsg);
      }
      return;
    }

    const exchangeGoogleToken = async () => {
      try {
        const response = await fetch('/api/v1/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id_token: idToken }),
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({ detail: 'Google sign-in failed' }));
          throw new Error(err.detail || `Google sign-in failed (${response.status})`);
        }

        const data = await response.json();

        if (window.opener) {
          window.opener.postMessage({ type: 'GOOGLE_AUTH', token: data.access_token }, window.location.origin);
          window.close();
        } else {
          localStorage.setItem('auth_token', data.access_token);
          router.push('/');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Google sign-in failed';
        if (window.opener) {
          window.opener.postMessage({ type: 'GOOGLE_AUTH', error: message }, window.location.origin);
          window.close();
        } else {
          setError(message);
        }
      }
    };

    exchangeGoogleToken();
  }, [router]);

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 bg-brand-bg-light dark:bg-brand-bg-dark">
        <div className="bg-white dark:bg-brand-card-dark rounded-2xl p-8 shadow-card max-w-md w-full text-center border border-red-200 dark:border-red-900/50">
          <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Sign-in Failed</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{error}</p>
          <Link href="/auth/login" className="inline-flex px-5 py-2 rounded-xl bg-gradient-brand hover:opacity-90 text-white font-medium text-sm transition-all">
            Back to Sign In
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-brand-bg-light dark:bg-brand-bg-dark">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-brand-green border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Completing sign in with Google...</p>
      </div>
    </main>
  );
}
