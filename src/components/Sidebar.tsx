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

const activeClasses = 'bg-emerald-50 dark:bg-emerald-950/40 text-brand-green dark:text-brand-green-dark font-semibold';
const inactiveClasses = 'text-gray-600 dark:text-gray-400 hover:bg-emerald-50/50 dark:hover:bg-white/[0.04] hover:text-brand-green dark:hover:text-brand-green-dark font-medium';

const categoryColors: Record<string, string> = {
  'Tafsir': 'bg-amber-500',
  'Politics': 'bg-blue-500',
  'Theology': 'bg-emerald-500',
  'Economics': 'bg-yellow-500',
  'Jurisprudence': 'bg-purple-500',
  'Social Issues': 'bg-rose-500',
  'History': 'bg-orange-500',
  'Guidance': 'bg-teal-500',
};

function NavLink({
  href,
  dotColor,
  label,
  isActive,
  isCollapsed,
  onNavigate,
}: {
  href: string;
  dotColor?: string;
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
        ${isCollapsed ? 'justify-center px-2 py-3.5' : 'px-3 py-3 lg:py-2.5'}
        ${isActive ? activeClasses : inactiveClasses}
      `}
    >
      {isActive && !isCollapsed && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-brand-green dark:bg-brand-green-dark rounded-full" />
      )}

      {dotColor ? (
        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dotColor} ${isActive ? 'ring-2 ring-offset-1 ring-brand-green/30 dark:ring-offset-brand-sidebar-dark' : ''}`} />
      ) : (
        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-gray-300 dark:bg-gray-600" />
      )}
      {!isCollapsed && <span className="text-sm truncate">{label}</span>}

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

  const getCategoryDot = (cat: string) => categoryColors[cat] || 'bg-gray-400';

  const showCollapsed = isOpen ? false : isCollapsed;

  const handleMobileClose = useCallback(() => {
    if (window.innerWidth < 1024) onClose();
  }, [onClose]);

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
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile: bottom sheet */}
      <div
        ref={sidebarRef}
        role="dialog"
        aria-modal={isOpen ? 'true' : undefined}
        aria-label="Navigation sidebar"
        className={`
          fixed bottom-0 left-0 right-0 z-50
          lg:static lg:fixed lg:top-20 lg:left-0 lg:h-[calc(100vh-5rem)]
          flex flex-col
          bg-white dark:bg-brand-sidebar-dark
          lg:border-r border-gray-100 dark:border-white/[0.06]
          shadow-xl dark:shadow-black/40
          transition-all duration-300 ease-in-out motion-reduce:transition-none
          ${isOpen
            ? 'translate-y-0 rounded-t-3xl'
            : 'translate-y-full lg:translate-y-0'}
          lg:rounded-none lg:translate-x-0
          ${isCollapsed ? 'lg:w-16' : 'lg:w-64'}
          max-h-[80vh] lg:max-h-none
        `}
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-2 pb-1 lg:hidden flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>

        {/* Top accent line (desktop) */}
        <div className="hidden lg:block h-0.5 bg-gradient-brand flex-shrink-0" />

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
            onClick={() => onCollapse?.()}
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
            label="All Books"
            isActive={isHome}
            isCollapsed={showCollapsed}
            onNavigate={handleMobileClose}
          />

          <NavLink
            href="/biography"
            label="Biography"
            isActive={isBiography}
            isCollapsed={showCollapsed}
            onNavigate={handleMobileClose}
          />

          <NavLink
            href="/about"
            label="About"
            isActive={pathname === '/about'}
            isCollapsed={showCollapsed}
            onNavigate={handleMobileClose}
          />

          <NavLink
            href="/ai-context-finder"
            label="AI Search"
            isActive={pathname === '/ai-context-finder'}
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
                dotColor={getCategoryDot(cat)}
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
          <div className="flex-shrink-0 px-4 py-3 border-t border-gray-100 dark:border-white/[0.06] hidden lg:block">
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
