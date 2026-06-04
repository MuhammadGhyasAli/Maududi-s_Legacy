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

interface GoogleSignInButtonProps {
  mode?: 'signin' | 'signup';
}

export default function GoogleSignInButton({ mode = 'signin' }: GoogleSignInButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const { googleSignIn } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const initializedRef = useRef(false);
  const callbackRef = useRef<(response: { credential: string }) => void>(undefined);

  const handleCredentialResponse = useCallback(async (response: { credential: string }) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/v1/auth/google', {
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
    if (!GOOGLE_CLIENT_ID || initializedRef.current) return;
    initializedRef.current = true;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google?.accounts?.id && buttonRef.current) {
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
      }
    };
    document.body.appendChild(script);

    return () => {
      const scriptEl = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (scriptEl) scriptEl.remove();
    };
  }, [mode]);

  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <div className="w-full">
      <div ref={buttonRef} className={`flex justify-center ${loading ? 'opacity-50 pointer-events-none' : ''}`} />
      {loading && (
        <p className="text-xs text-gray-400 text-center mt-1">Connecting to Google...</p>
      )}
      {error && (
        <p className="text-xs text-red-500 text-center mt-1">{error}</p>
      )}
    </div>
  );
}
