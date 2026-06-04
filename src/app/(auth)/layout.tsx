"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthFormLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/80 dark:bg-brand-bg-dark">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-brand-bg-dark/90 backdrop-blur-lg border-b border-emerald-100/40 dark:border-emerald-900/20 transition-all duration-300">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left — logo */}
            <Link href="/" className="flex items-center gap-2.5 group" aria-label="Go to home">
              <Image
                src="/logo.png"
                alt="Maududi's Legacy"
                width={160}
                height={40}
                className="h-7 sm:h-10 w-auto object-contain"
                priority
              />
              <span className="hidden sm:inline text-base sm:text-lg font-display font-semibold truncate max-w-[120px] sm:max-w-none text-gray-800 dark:text-gray-100 group-hover:text-brand-green dark:group-hover:text-brand-green-dark transition-colors">
                Maududi&apos;s Legacy
              </span>
            </Link>

            {/* Right — actions */}
            <div className="flex items-center gap-2">
              {/* Auth */}
              {user ? (
                <div className="flex items-center gap-2">
                  <Link
                    href="/account/settings"
                    className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 border border-transparent hover:border-gray-200 dark:hover:border-white/10 transition-all duration-200"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => { logout(); router.push('/'); }}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200 cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/auth/login"
                    className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 border border-gray-200 dark:border-gray-700 transition-all duration-200"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-gradient-brand hover:opacity-90 shadow-md shadow-emerald-500/20 transition-all duration-200"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center px-4 pt-20 pb-12">
        <div className="w-full max-w-sm">
          <div className="bg-white dark:bg-brand-card-dark rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.08)] dark:shadow-none border border-gray-200/80 dark:border-gray-700/50 p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
