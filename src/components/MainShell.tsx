"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import ScrollToTop from "./ScrollToTop";
import { ToastProvider } from "./Toast";
import OnboardingTour from "./OnboardingTour";
import ShortcutsModal from "./ShortcutsModal";
import QuickSearchModal from "./QuickSearchModal";
import CookieConsent from "./CookieConsent";
import type { Theme } from "../types/theme";
import { apiService } from "../services/apiService";

import { usePathname } from 'next/navigation';

export default function MainShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "system";
    return (localStorage.getItem("theme") as Theme) || "system";
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(true);

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
  const categorySlugs = ['tafsir', 'politics', 'theology', 'economics', 'jurisprudence', 'social-issues', 'history', 'guidance'];
  const isBookDetail = segments.length === 2 && categorySlugs.includes(segments[0]);
  const hideSidebar = isChatRoute || isBookDetail || isAuthRoute;
  const hideHeader = isChatRoute;

  return (
    <ToastProvider>
      <OnboardingTour />
      <ShortcutsModal />
      <QuickSearchModal />
      <div className="min-h-screen bg-brand-bg-light dark:bg-brand-bg-dark text-gray-900 dark:text-gray-100 transition-colors duration-300 flex overflow-x-clip">
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

        {!hideSidebar && !isAuthRoute && <ScrollToTop />}
      </div>
    </ToastProvider>
  );
}

