'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: {
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              text?: 'signin_with' | 'signup_with' | 'continue_with';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              logo_alignment?: 'left' | 'center';
            },
          ) => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

let gsiInitialized = false;
let gsiScriptAdded = false;

interface GoogleSignInButtonProps {
  mode?: 'signin' | 'signup';
  className?: string;
}

export default function GoogleSignInButton({ mode = 'signin', className = '' }: GoogleSignInButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const { googleSignIn } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const callbackRef = useRef<(response: { credential: string }) => void>(undefined);

  const handleCredentialResponse = useCallback(async (response: { credential: string }) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_token: response.credential }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ detail: 'Google sign-in failed' }));
        throw new Error(errData.detail || `Google sign-in failed (${res.status})`);
      }
      const data = await res.json();
      await googleSignIn(data.access_token);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  }, [googleSignIn, router]);

  callbackRef.current = handleCredentialResponse;

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || gsiInitialized) return;

    const initGsi = () => {
      if (gsiInitialized || !window.google?.accounts?.id || !buttonRef.current) return;
      gsiInitialized = true;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => callbackRef.current?.(response),
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        text: mode === 'signin' ? 'signin_with' : 'signup_with',
        shape: 'rectangular',
        logo_alignment: 'center',
      });
    };

    if (window.google?.accounts?.id) {
      initGsi();
    } else if (!gsiScriptAdded) {
      gsiScriptAdded = true;
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initGsi;
      document.body.appendChild(script);
    }
  }, [mode]);

  if (!GOOGLE_CLIENT_ID) {
    return (
      <div className="w-full">
        <button
          disabled
          className="w-full py-3 px-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-brand-card-dark text-gray-400 dark:text-gray-500 cursor-not-allowed flex items-center justify-center gap-2"
          aria-disabled="true"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <span>Google not configured</span>
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      <div ref={buttonRef} className={`flex justify-center ${loading ? 'opacity-50 pointer-events-none' : ''}`} />
      {loading && (
        <p className="text-xs text-gray-400 text-center mt-1">Connecting to Google...</p>
      )}
      {error && (
        <p className="text-xs text-red-500 text-center mt-1" role="alert">{error}</p>
      )}
    </div>
  );
}