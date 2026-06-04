"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

const Header = React.memo(function Header({
  theme,
  setTheme,
  onToggleSidebar,
  isSidebarOpen: _isSidebarOpen,
  onToggleDesktopSidebar: _onToggleDesktopSidebar,
}: HeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();

  // Prefetch critical routes for instant navigation
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

  const handleOpenContextFinder = () => {
    router.push('/ai-context-finder');
  };

  const themeIcons: Record<Theme, React.ReactNode> = {
    light: <SunIcon className="w-5 h-5" />,
    dark:  <MoonIcon className="w-5 h-5" />,
    system: <SystemIcon className="w-5 h-5" />,
  };

  return (
    <header className="
      fixed top-0 left-0 right-0 z-50
      bg-white/80 dark:bg-brand-navy/90
      backdrop-blur-md
      border-b border-emerald-100/60 dark:border-white/5
      transition-all duration-300
      shadow-sm dark:shadow-brand-navy
    ">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">

        {/* Left — hamburger + logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-gray-600 dark:text-gray-300 cursor-pointer
                       hover:bg-emerald-50 dark:hover:bg-white/10 transition-colors"
            aria-label="Toggle sidebar"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Logo / brand mark */}
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 group cursor-pointer"
            aria-label="Go to home"
          >
            <Image
              src="/logo.png"
              alt="Maududi's Legacy"
              width={180}
              height={48}
              className="h-8 sm:h-12 w-auto object-contain"
              priority
            />
          </button>
        </div>

        {/* Right — actions */}
        <div className="flex items-center gap-1.5">
          {/* AI Context Finder */}
          <button
            onClick={handleOpenContextFinder}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium cursor-pointer
                       text-brand-green dark:text-brand-green-dark
                       hover:bg-emerald-50 dark:hover:bg-emerald-950/50
                       border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800
                       transition-all duration-200"
            aria-label="Open AI Context Finder"
          >
            <SparklesIcon className="w-4 h-4" />
            <span className="hidden sm:inline">AI Search</span>
          </button>

          {/* Auth */}
          {authLoading ? null : user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium cursor-pointer
                           text-gray-700 dark:text-gray-200
                           hover:bg-gray-100 dark:hover:bg-white/10
                           border border-transparent hover:border-gray-200 dark:hover:border-white/10
                           transition-all duration-200"
                aria-label="User menu"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                  {(user.display_name || user.username)[0].toUpperCase()}
                </div>
                <span className="hidden sm:inline">{user.display_name || user.username}</span>
              </button>

              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 z-50 w-48 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg py-1">
                    <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                      {user.email}
                    </div>
                    <button
                      onClick={() => { setUserMenuOpen(false); router.push('/auth/settings'); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    >
                      Account Settings
                    </button>
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); router.push('/'); }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={() => router.push('/auth/login')}
              className="px-3 py-2 rounded-xl text-sm font-medium cursor-pointer
                         bg-emerald-600 hover:bg-emerald-700 text-white
                         transition-colors duration-200"
              aria-label="Sign in"
            >
              Sign In
            </button>
          )}

          {/* Theme toggle */}
          <button
            onClick={handleThemeChange}
            className="p-2.5 rounded-xl cursor-pointer
                       text-gray-500 dark:text-gray-400
                       hover:bg-gray-100 dark:hover:bg-white/10
                       hover:text-brand-green dark:hover:text-brand-green-dark
                       border border-transparent hover:border-gray-200 dark:hover:border-white/10
                       transition-all duration-200"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'} mode`}
          >
            {themeIcons[theme]}
          </button>
        </div>
      </div>
    </header>
  );
});

export default Header;
