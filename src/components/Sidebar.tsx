"use client";

import React, { useEffect, useRef, useCallback, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CATEGORIES } from '../constants';
import { slugify } from '../utils/slugify';
import { apiService } from '../services/apiService';
import { Book } from '../types';
import CloseIcon from './icons/CloseIcon';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  onCollapse?: () => void;
}

// --- Sidebar SVG icons (feather/heroicons style) ---
const BookOpenMini: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
  </svg>
);
const PenIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
  </svg>
);
const InfoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
  </svg>
);
const SearchIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);
const BuildingIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
  </svg>
);
const MoonStarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
  </svg>
);
const CurrencyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);
const ScaleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 0 1-2.031.352 5.988 5.988 0 0 1-2.031-.352c-.483-.174-.711-.703-.589-1.202L18.75 4.971ZM5.25 4.97c-1.01.143-2.01.317-3 .52m3-.52L2.63 15.696c-.122.499.106 1.028.589 1.202a5.989 5.989 0 0 0 2.031.352 5.989 5.989 0 0 0 2.031-.352c.483-.174.711-.703.589-1.202L5.25 4.971Z" />
  </svg>
);
const UsersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
  </svg>
);
const ClockIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);
const CompassIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.712 4.33a9.027 9.027 0 0 1 1.652 1.306c.51.51.944 1.064 1.306 1.652M16.712 4.33l-3.448 4.138m3.448-4.138a9.014 9.014 0 0 0-9.424 0M19.67 7.288l-4.138 3.448m4.138-3.448a9.014 9.014 0 0 1 0 9.424m-4.138-5.976a3.736 3.736 0 0 0-.88-1.388 3.737 3.737 0 0 0-1.388-.88m2.268 2.268a3.765 3.765 0 0 1 0 2.528m-2.268-4.796-.853.853m0 0a3.75 3.75 0 0 1-2.528 0m2.528 0-.853-.853m-1.675 3.381a3.736 3.736 0 0 0 .88 1.388 3.737 3.737 0 0 0 1.388.88m-2.268-2.268a3.765 3.765 0 0 1 0-2.528m0 2.528.853-.853m-2.528 2.528-3.448 4.138m3.448-4.138a9.014 9.014 0 0 0-9.424 0m9.424 0-4.138-3.448m0 0a9.027 9.027 0 0 0-1.306 1.652M4.33 16.712a9.027 9.027 0 0 0 1.306 1.652M4.33 16.712l4.138-3.448m-4.138 3.448a9.014 9.014 0 0 0 9.424 0m-5.976-4.138a3.736 3.736 0 0 0 1.388.88" />
  </svg>
);

const linkBase = `
  flex items-center gap-3 rounded-xl transition-all duration-200 relative group cursor-pointer
  motion-reduce:transition-none
`;

const activeClasses = 'bg-brand-green text-white font-semibold';
const inactiveClasses = 'text-gray-600 dark:text-gray-400 hover:bg-emerald-50/50 dark:hover:bg-white/[0.04] hover:text-brand-green dark:hover:text-brand-green-dark font-medium';

function NavLink({
  href,
  icon,
  label,
  isActive,
  isCollapsed,
  onNavigate,
  count,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  isCollapsed: boolean;
  onNavigate: () => void;
  count?: number;
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
      {/* Left accent bar on active item */}
      {isActive && !isCollapsed && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-white/70 rounded-full" />
      )}

      <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center" aria-hidden="true">{icon}</span>
      {!isCollapsed && (
        <span className="flex-1 flex items-center justify-between min-w-0">
          <span className="text-sm truncate">{label}</span>
          {count !== undefined && (
            <span className="ml-2 text-[10px] font-medium text-gray-400 dark:text-gray-500 tabular-nums">{count}</span>
          )}
        </span>
      )}
      {isCollapsed && count !== undefined && (
        <span className="
          absolute left-full ml-8 px-2 py-0.5 text-[10px] font-medium text-white
          bg-gray-800 dark:bg-gray-700 rounded-md
          opacity-0 group-hover:opacity-100 transition-opacity motion-reduce:transition-none
          pointer-events-none z-50
        ">
          {count}
        </span>
      )}

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
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    apiService.getBooks().then((books: Book[]) => {
      const counts: Record<string, number> = {};
      books.forEach(b => {
        counts[b.category] = (counts[b.category] || 0) + 1;
      });
      setCategoryCounts(counts);
    }).catch(() => {});
  }, []);

  const firstSegment = pathname.split('/').filter(Boolean)[0] || '';
  const categorySlugs = new Set(
    CATEGORIES.slice(1).map((cat) => slugify(cat))
  );
  const category = categorySlugs.has(firstSegment) ? firstSegment : undefined;

  const isHome = !category && pathname === '/';
  const isBiography = pathname === '/biography';

  const getCategoryIcon = (cat: string) => {
    const icons: Record<string, React.ReactNode> = {
      'Tafsir': <BookOpenMini />,
      'Politics': <BuildingIcon />,
      'Theology': <MoonStarIcon />,
      'Economics': <CurrencyIcon />,
      'Jurisprudence': <ScaleIcon />,
      'Social Issues': <UsersIcon />,
      'History': <ClockIcon />,
      'Guidance': <CompassIcon />,
    };
    return icons[cat] || <BookOpenMini />;
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
        role={isOpen ? 'dialog' : undefined}
        aria-modal={isOpen ? 'true' : undefined}
        aria-label="Navigation sidebar"
        className={
          'fixed left-0 z-50 ' +
          'h-screen lg:top-16 lg:h-[calc(100vh-4rem)] ' +
          'flex flex-col ' +
          'bg-white dark:bg-brand-sidebar-dark ' +
          'lg:border-r border-gray-100 dark:border-white/[0.06] ' +
          'shadow-xl dark:shadow-black/40 ' +
          'transition-all duration-300 ease-in-out motion-reduce:transition-none ' +
          (isOpen ? 'translate-x-0 ' : '-translate-x-full ') +
          'lg:translate-x-0 ' +
          (isOpen ? 'w-full sm:w-[70vw] md:w-[60vw] ' : '') +
          (isCollapsed ? 'lg:w-16 ' : 'lg:w-64 ')
        }
      >
        {/* Top accent line */}
        <div className="h-px bg-gray-200 dark:bg-white/10 flex-shrink-0" />

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
        <div className={`hidden lg:flex items-center flex-shrink-0 ${showCollapsed ? 'justify-center px-2' : 'justify-between px-4'} py-4`}>
          {!showCollapsed && (
            <h2 className="text-sm font-semibold tracking-widest uppercase text-gray-400 dark:text-gray-500">
              Navigation
            </h2>
          )}
          <button
            onClick={() => onCollapse?.()}
            className="p-1.5 rounded-lg bg-gray-50 dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-emerald-950/50
                       text-gray-500 dark:text-gray-400 hover:text-brand-green dark:hover:text-brand-green-dark
                       border border-gray-200 dark:border-white/10 transition-all duration-200 motion-reduce:transition-none cursor-pointer"
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
            icon={<BookOpenMini />}
            label="All Books"
            isActive={isHome}
            isCollapsed={showCollapsed}
            onNavigate={handleMobileClose}
          />

          <NavLink
            href="/biography"
            icon={<PenIcon />}
            label="Biography"
            isActive={isBiography}
            isCollapsed={showCollapsed}
            onNavigate={handleMobileClose}
          />

          <NavLink
            href="/about"
            icon={<InfoIcon />}
            label="About"
            isActive={pathname === '/about'}
            isCollapsed={showCollapsed}
            onNavigate={handleMobileClose}
          />

          <NavLink
            href="/ai-context-finder"
            icon={<SearchIcon />}
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
            const slug = slugify(cat);
            return (
              <NavLink
                key={cat}
                href={`/${slug}`}
                icon={getCategoryIcon(cat)}
                label={cat}
                isActive={category === slug}
                isCollapsed={showCollapsed}
                onNavigate={handleMobileClose}
                count={categoryCounts[cat]}
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
