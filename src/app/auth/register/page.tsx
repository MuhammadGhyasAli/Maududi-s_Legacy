'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState('');

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
      await register(email, email, password, displayName || undefined);
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4">
       <div className="w-full max-w-sm card-glass p-8 shadow-lg rounded-2xl">
         <h1 className="text-3xl font-bold gradient-text text-center mb-8">
           Create Account
         </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Full Name <span className="text-gray-400">(optional)</span>
            </label>
             <input
               id="displayName"
               type="text"
               value={displayName}
               onChange={e => setDisplayName(e.target.value)}
               className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-200"
               placeholder="Your full name"
             />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
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

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
             <input
               id="password"
               type="password"
               value={password}
               onChange={e => setPassword(e.target.value)}
               required
               minLength={6}
               className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-200"
               placeholder="At least 6 characters"
             />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm Password
            </label>
             <input
               id="confirmPassword"
               type="password"
               value={confirmPassword}
               onChange={e => setConfirmPassword(e.target.value)}
               required
               minLength={6}
               className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all duration-200"
               placeholder="Repeat your password"
             />
          </div>

           <button
             type="submit"
             disabled={loading}
             className="w-full py-3 px-6 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium disabled:opacity-50 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
           >
             {loading ? 'Creating account...' : 'Create Account'}
           </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">or continue with</span>
          </div>
        </div>

           <button
             type="button"
             onClick={() => {
               const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
               if (!clientId) {
                 setError('Google sign-in is not configured yet.');
                 return;
               }
               // Generate a nonce and store it in sessionStorage
               const array = new Uint8Array(32);
               window.crypto.getRandomValues(array);
               const nonce = Array.from(array, dec => dec.toString(16).padStart(2, '0')).join('');
               sessionStorage.setItem('google_nonce', nonce);

               const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || `${window.location.origin}/auth/google/callback`;
               const params = new URLSearchParams({
                 client_id: clientId,
                 redirect_uri: redirectUri,
                 response_type: 'token id_token',
                 scope: 'openid email profile',
                 nonce: nonce, // Include nonce to prevent replay attacks
               });
               window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
             }}
             className="w-full flex items-center justify-center py-2.5 px-4 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 cursor-pointer"
           >
              <Image 
                src="https://img.icons8.com/?size=100&id=17949&format=png&color=000000" 
                alt="Google" 
                width={20}
                height={20}
                className="h-5 w-5 mr-2"
                priority
              />
             Sign in with Google
            </button>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
              Sign in
            </Link>
          </p>
          </div>
    </main>
  );
}
