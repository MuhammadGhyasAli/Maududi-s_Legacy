"use client";

import React, { useEffect, useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import ScrollToTop from "./ScrollToTop";
import { ToastProvider } from "./Toast";
import type { Theme } from "../types/theme";
import { apiService } from "../services/apiService";

import { usePathname } from 'next/navigation';

export default function MainShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "system";
    return (localStorage.getItem("theme") as Theme) || "system";
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);

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

  return (
    <ToastProvider>
      <div className="min-h-screen bg-brand-bg-light dark:bg-brand-bg-dark text-gray-900 dark:text-gray-100 transition-colors duration-300 flex overflow-x-hidden">
        {!isChatRoute && (
          <>
            <Sidebar
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
              isCollapsed={isDesktopSidebarCollapsed}
              onCollapse={() => setIsDesktopSidebarCollapsed(!isDesktopSidebarCollapsed)}
            />

            <Header
              theme={theme}
              setTheme={setTheme}
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
              isSidebarOpen={isSidebarOpen}
              onToggleDesktopSidebar={() => setIsDesktopSidebarCollapsed(!isDesktopSidebarCollapsed)}
            />
          </>
        )}

        <div id="main-content" className={`flex-1 flex flex-col min-w-0 ${isChatRoute ? '' : (isDesktopSidebarCollapsed ? "lg:ml-16" : "lg:ml-64") + ' pt-20'}`}>
          <div className="flex-1 h-full">{children}</div>
          {!isChatRoute && <Footer />}
        </div>

        {!isChatRoute && <ScrollToTop />}
      </div>
    </ToastProvider>
  );
}

