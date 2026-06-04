"use client";

import React, { useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CATEGORIES } from '../constants';
import CloseIcon from './icons/CloseIcon';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onCollapse?: () => void;
}

const linkBase = `
  flex items-center gap-3 rounded-xl transition-all duration-200 relative group cursor-pointer
  motion-reduce:transition-none
`;

const activeClasses = 'bg-gradient-brand text-white shadow-emerald font-semibold';
const inactiveClasses = 'text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-white/[0.06] hover:text-brand-green dark:hover:text-brand-green-dark font-medium';

function NavLink({
  href,
  icon,
  label,
  isActive,
  isCollapsed,
  onNavigate,
}: {
  href: string;
  icon: string;
  label: string;
  isActive: boolean;
  isCollapsed: boolean;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      title={isCollapsed ? label : undefined}
      aria-current={isActive ? 'page' : undefined}
      className={`
        ${linkBase}
        ${isCollapsed ? 'justify-center px-2 py-3.5' : 'px-3 py-2.5'}
        ${isActive ? activeClasses : inactiveClasses}
      `}
    >
      {/* Left accent bar on active item */}
      {isActive && !isCollapsed && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-white/70 rounded-full" />
      )}

      <span className="text-lg flex-shrink-0">{icon}</span>
      {!isCollapsed && <span className="text-sm truncate">{label}</span>}

      {/* Tooltip when collapsed */}
      {isCollapsed && (
        <span className="
          absolute left-full ml-3 px-2.5 py-1.5 text-xs font-medium text-white
          bg-gray-900 dark:bg-gray-800 rounded-lg shadow-lg
          opacity-0 group-hover:opacity-100 transition-opacity motion-reduce:transition-none
          pointer-events-none whitespace-nowrap z-50
        ">
          {label}
        </span>
      )}
    </Link>
  );
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isCollapsed = false, onCollapse }) => {
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const firstSegment = pathname.split('/').filter(Boolean)[0] || '';
  const categorySlugs = new Set(
    CATEGORIES.slice(1).map((cat) => cat.toLowerCase().replace(/\s+/g, '-'))
  );
  const category = categorySlugs.has(firstSegment) ? firstSegment : undefined;

  const isHome = !category && pathname === '/';
  const isBiography = pathname === '/biography';

  const getCategoryIcon = (cat: string) => {
    const icons: Record<string, string> = {
      'Tafsir': '📖',
      'Politics': '🏛️',
      'Theology': '🕌',
      'Economics': '💰',
      'Jurisprudence': '⚖️',
      'Social Issues': '🤝',
      'History': '📜',
      'Guidance': '🧭',
    };
    return icons[cat] || '📚';
  };

  // On mobile sidebar opens as overlay — always show expanded (icons + labels).
  // Only respect isCollapsed on desktop.
  const showCollapsed = isOpen ? false : isCollapsed;

  const handleMobileClose = useCallback(() => {
    if (window.innerWidth < 1024) onClose();
  }, [onClose]);

  // Escape key + focus trap on mobile
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab' && sidebarRef.current) {
        const focusable = sidebarRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Scroll nav to top when mobile opens
  useEffect(() => {
    if (isOpen && navRef.current) {
      navRef.current.scrollTop = 0;
    }
  }, [isOpen]);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar panel */}
      <div
        ref={sidebarRef}
        role="dialog"
        aria-modal={isOpen ? 'true' : undefined}
        aria-label="Navigation sidebar"
        className={`
          fixed lg:fixed lg:top-20 left-0 h-screen lg:h-[calc(100vh-5rem)]
          z-40 flex flex-col overflow-x-hidden
          bg-white dark:bg-brand-sidebar-dark
          border-r border-gray-100 dark:border-white/[0.06]
          shadow-xl dark:shadow-black/40
          transition-all duration-300 ease-in-out motion-reduce:transition-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          ${isOpen ? 'w-[75vw] sm:w-[70vw] md:w-[60vw]' : ''}
          ${isCollapsed ? 'lg:w-16' : 'lg:w-64'}
        `}
      >
        {/* Top accent line */}
        <div className="h-0.5 bg-gradient-brand flex-shrink-0" />

        {/* Mobile header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/[0.06] lg:hidden flex-shrink-0">
          <h2 className="text-base font-semibold text-brand-green dark:text-brand-green-dark">
            Navigation
          </h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors motion-reduce:transition-none cursor-pointer"
            aria-label="Close sidebar"
          >
            <CloseIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Desktop header */}
        <div className={`hidden lg:flex items-center justify-between px-4 py-4 flex-shrink-0 ${showCollapsed ? 'justify-center' : ''}`}>
          {!showCollapsed && (
            <h2 className="text-sm font-semibold tracking-widest uppercase text-gray-400 dark:text-gray-500">
              Navigation
            </h2>
          )}
          <button
            onClick={onCollapse}
            className="p-1.5 rounded-lg bg-gray-50 dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-emerald-950/50
                       text-gray-500 dark:text-gray-400 hover:text-brand-green dark:hover:text-brand-green-dark
                       border border-gray-200 dark:border-white/10 transition-all duration-200 motion-reduce:transition-none"
            aria-label={showCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d={showCollapsed ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'} />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <nav ref={navRef} role="navigation" aria-label="Main navigation" className="flex-1 overflow-y-auto overflow-x-hidden px-2 pb-4 space-y-0.5">
          <NavLink
            href="/"
            icon="📚"
            label="All Books"
            isActive={isHome}
            isCollapsed={showCollapsed}
            onNavigate={handleMobileClose}
          />

          <NavLink
            href="/biography"
            icon="📝"
            label="Biography"
            isActive={isBiography}
            isCollapsed={showCollapsed}
            onNavigate={handleMobileClose}
          />

          <NavLink
            href="/about"
            icon="ℹ️"
            label="About"
            isActive={pathname === '/about'}
            isCollapsed={showCollapsed}
            onNavigate={handleMobileClose}
          />

          {/* Separator */}
          {!showCollapsed && (
            <div className="px-3 py-2" aria-hidden="true">
              <div className="h-px bg-gray-200 dark:bg-white/10" />
            </div>
          )}

          {/* Category links */}
          {CATEGORIES.slice(1).map((cat) => {
            const slug = cat.toLowerCase().replace(/\s+/g, '-');
            return (
              <NavLink
                key={cat}
                href={`/${slug}`}
                icon={getCategoryIcon(cat)}
                label={cat}
                isActive={category === slug}
                isCollapsed={showCollapsed}
                onNavigate={handleMobileClose}
              />
            );
          })}
        </nav>

        {/* Footer branding */}
        {!showCollapsed && (
          <div className="flex-shrink-0 px-4 py-3 border-t border-gray-100 dark:border-white/[0.06]">
            <p className="text-[10px] font-medium tracking-wider uppercase text-gray-400 dark:text-gray-600 text-center">
              Maududi&apos;s Legacy
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;
