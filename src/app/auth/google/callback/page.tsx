'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    console.log('Callback hash received, length:', hash.length);
    const params = new URLSearchParams(hash);
    const idToken = params.get('id_token');
    const nonce = params.get('nonce');

    // Verify nonce if present (security best practice)
    if (nonce) {
      const storedNonce = sessionStorage.getItem('google_nonce');
      if (storedNonce !== nonce) {
        setError('Invalid nonce. Please try again.');
        sessionStorage.removeItem('google_nonce');
        return;
      }
      sessionStorage.removeItem('google_nonce');
    }

    if (!idToken) {
      console.error('No id_token in hash, all params:', Array.from(params.keys()));
      setError('No Google ID token received. Please try again.');
      return;
    }
    console.log('id_token received, length:', idToken.length);

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
        localStorage.setItem('auth_token', data.access_token);
        router.push('/');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Google sign-in failed';
        console.error('Google auth callback error:', err);
        setError(message);
      }
    };

    exchangeGoogleToken();
  }, [router]);

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center">
        {error ? (
          <div>
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button
              onClick={() => router.push('/auth/login')}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600 dark:text-gray-300">Completing sign in with Google...</p>
          </div>
        )}
      </div>
    </main>
  );
}
