"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import MobileNav from "./MobileNav";
import ScrollToTop from "./ScrollToTop";
import { ToastProvider } from "./Toast";
import OnboardingTour from "./OnboardingTour";
import ShortcutsModal from "./ShortcutsModal";
import QuickSearchModal from "./QuickSearchModal";
import CookieConsent from "./CookieConsent";
import type { Theme } from "../types/theme";
import { apiService } from "../services/apiService";

import { usePathname } from 'next/navigation';
import NavigationProgress from './NavigationProgress';
import { CATEGORY_SLUGS } from '../constants';
import RateLimitListener from './RateLimitListener';

export default function MainShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "system";
    return (localStorage.getItem("theme") as Theme) || "system";
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(true);

  // Global 't' shortcut to cycle theme
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
      if (e.key === 't') {
        e.preventDefault();
        setTheme(prev => {
          const themes: Theme[] = ['light', 'dark', 'system'];
          const nextIndex = (themes.indexOf(prev) + 1) % themes.length;
          return themes[nextIndex];
        });
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [setTheme]);

  // Prefetch book data in background as soon as shell mounts
  useEffect(() => {
    apiService.getBooks().catch(() => {}); // silent prefetch
    apiService.getCategories().catch(() => {}); // silent prefetch
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const updateTheme = () => {
      const isDark =
        theme === "dark" ||
        (theme === "system" && mediaQuery.matches);
      root.classList.toggle("dark", isDark);
      localStorage.setItem("theme", theme);
    };

    updateTheme();

    if (theme === "system") {
      const handler = () => updateTheme();
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
  }, [theme]);

  const isChatRoute = pathname?.includes('/chat') || pathname?.includes('/ai-context-finder');
  const isAuthRoute = pathname?.startsWith('/auth');
  const segments = pathname?.split('/').filter(Boolean) || [];
  const isBookDetail = segments.length === 2 && CATEGORY_SLUGS.includes(segments[0]);
  const hideSidebar = isChatRoute || isBookDetail || isAuthRoute;
  const hideHeader = isChatRoute;

  return (
    <ToastProvider>
      <NavigationProgress />
      <RateLimitListener />
      <OnboardingTour />
      <ShortcutsModal />
      <QuickSearchModal />
      <div className="min-h-screen bg-brand-bg-light dark:bg-brand-bg-dark text-gray-900 dark:text-gray-100 transition-colors duration-300 flex overflow-x-clip relative">
        {/* Background ambient blobs */}
        <div className="absolute top-20 left-10 w-96 h-96 rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 blur-[120px] pointer-events-none select-none animate-float-slow z-0" />
        <div className="absolute top-[35vh] right-10 w-96 h-96 rounded-full bg-cyan-500/10 dark:bg-cyan-500/5 blur-[120px] pointer-events-none select-none animate-float-slow-reverse z-0" />
        <div className="absolute bottom-10 left-1/3 w-96 h-96 rounded-full bg-amber-500/5 dark:bg-amber-500/2.5 blur-[120px] pointer-events-none select-none animate-float-slow z-0" />

        {!hideSidebar && (
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            isCollapsed={isDesktopSidebarCollapsed}
            onCollapse={() => setIsDesktopSidebarCollapsed(!isDesktopSidebarCollapsed)}
          />
        )}

        {!hideHeader && (
          <Header
            theme={theme}
            setTheme={setTheme}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        )}

          <div id="main-content" tabIndex={-1} className={`flex-1 flex flex-col min-w-0 ${hideHeader ? 'pt-0' : hideSidebar ? 'pt-20' : (isDesktopSidebarCollapsed ? "lg:ml-16" : "lg:ml-64") + ' pt-20'}`}>
        <CookieConsent />
          <div className="flex-1 h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -12 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: "easeInOut" }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
          {!hideSidebar && !isAuthRoute && <Footer />}
        </div>

        {!hideSidebar && !isChatRoute && !isAuthRoute && <MobileNav />}
        {!hideSidebar && !isAuthRoute && <ScrollToTop />}
      </div>
    </ToastProvider>
  );
}

