"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';
import SystemIcon from './icons/SystemIcon';
import SparklesIcon from './icons/SparklesIcon';
import { Theme } from '../types/theme';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  onToggleDesktopSidebar: () => void;
}

const navLinks = [
  { href: '/', label: 'Books' },
  { href: '/biography', label: 'Biography' },
  { href: '/about', label: 'About' },
];

const Header = React.memo(function Header({
  theme,
  setTheme,
  onToggleSidebar,
  isSidebarOpen: _isSidebarOpen,
  onToggleDesktopSidebar: _onToggleDesktopSidebar,
}: HeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: authLoading, logout } = useAuth();

  useEffect(() => {
    router.prefetch('/');
    router.prefetch('/auth/login');
    router.prefetch('/auth/register');
    router.prefetch('/biography');
    router.prefetch('/about');
  }, [router]);

  const handleThemeChange = () => {
    const themes: Theme[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const themeIcons: Record<Theme, React.ReactNode> = {
    light: <SunIcon className="w-5 h-5" />,
    dark:  <MoonIcon className="w-5 h-5" />,
    system: <SystemIcon className="w-5 h-5" />,
  };

  return (
    <header className="
      fixed top-0 left-0 right-0 z-50
      bg-white/90 dark:bg-brand-bg-dark/90
      backdrop-blur-lg
      border-b border-emerald-100/40 dark:border-emerald-900/20
      transition-all duration-300
    ">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Left — hamburger + logo */}
          <div className="flex items-center gap-1 sm:gap-3 min-w-0">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl text-gray-500 dark:text-gray-400
                         hover:bg-emerald-50 dark:hover:bg-white/5 transition-colors"
              aria-label="Toggle sidebar"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2.5 group"
              aria-label="Go to home"
            >
              <Image
                src="/logo.png"
                alt="Maududi's Legacy"
                width={160}
                height={40}
                className="h-7 sm:h-10 w-auto object-contain"
                priority
              />
              <span className="hidden sm:inline text-base sm:text-lg font-display font-semibold
                               truncate max-w-[120px] sm:max-w-none
                               text-gray-800 dark:text-gray-100
                               group-hover:text-brand-green dark:group-hover:text-brand-green-dark
                               transition-colors">
                Maududi&apos;s Legacy
              </span>
            </button>
          </div>

          {/* Center — desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActiveLink = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActiveLink
                      ? 'text-brand-green dark:text-brand-green-dark bg-emerald-50 dark:bg-emerald-950/40'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right — actions */}
          <div className="flex items-center gap-1.5">
            {/* AI Context Finder */}
            <button
              onClick={() => router.push('/ai-context-finder')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium
                         text-brand-green dark:text-brand-green-dark
                         hover:bg-emerald-50 dark:hover:bg-emerald-950/40
                         border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800/40
                         transition-all duration-200 cursor-pointer"
              aria-label="Open AI Context Finder"
            >
              <SparklesIcon className="w-4 h-4" />
              <span>AI Search</span>
            </button>

            {/* Auth */}
            {authLoading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium
                             text-gray-700 dark:text-gray-200
                             hover:bg-gray-50 dark:hover:bg-white/5
                             border border-transparent hover:border-gray-200 dark:hover:border-white/10
                             transition-all duration-200 cursor-pointer"
                  aria-label="User menu"
                  aria-haspopup="true"
                  aria-expanded={userMenuOpen}
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-brand flex items-center justify-center text-white text-xs font-bold shadow-sm">
                    {(user.display_name || user.email)[0].toUpperCase()}
                  </div>
                  <span className="hidden sm:inline max-w-[100px] truncate">{user.display_name || user.email}</span>
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" aria-hidden="true" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-xl bg-white dark:bg-brand-card-dark border border-gray-200 dark:border-gray-800 shadow-xl shadow-black/5 py-1.5 overflow-hidden">
                      <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-800">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{user.display_name || user.email}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{user.email}</p>
                      </div>
                      <button
                        onClick={() => { setUserMenuOpen(false); router.push('/auth/settings'); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Account Settings
                      </button>
                      <button
                        onClick={() => { logout(); setUserMenuOpen(false); router.push('/'); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                onClick={() => router.push('/auth/register')}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white
                           bg-gradient-brand hover:opacity-90
                           shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30
                           transition-all duration-200 cursor-pointer"
                aria-label="Get started"
              >
                Get Started
              </button>
            )}

            {/* Theme toggle */}
            <button
              onClick={handleThemeChange}
              className="p-2.5 rounded-xl text-gray-500 dark:text-gray-400
                         hover:bg-gray-50 dark:hover:bg-white/5
                         hover:text-brand-green dark:hover:text-brand-green-dark
                         transition-all duration-200 cursor-pointer"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'} mode`}
            >
              {themeIcons[theme]}
            </button>
          </div>
        </div>


      </div>
    </header>
  );
});

export default Header;
