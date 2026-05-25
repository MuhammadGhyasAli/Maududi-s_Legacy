"use client";

import React from 'react';
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

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isCollapsed = false, onCollapse }) => {
  const pathname = usePathname();
  const firstSegment = pathname.split('/').filter(Boolean)[0] || '';
  const categorySlugs = new Set(
    CATEGORIES.slice(1).map((cat) => cat.toLowerCase().replace(/\s+/g, '-'))
  );
  const category = categorySlugs.has(firstSegment) ? firstSegment : undefined;

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

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <div
        className={`
          fixed lg:fixed lg:top-20 left-0 h-screen lg:h-[calc(100vh-5rem)]
          z-40 flex flex-col
          bg-white dark:bg-brand-sidebar-dark
          border-r border-gray-100 dark:border-white/[0.06]
          shadow-xl dark:shadow-black/40
          transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          ${isCollapsed ? 'w-16' : 'w-64'}
        `}
      >
        {/* Top accent line */}
        <div className="h-0.5 bg-gradient-brand flex-shrink-0" />

        {/* Mobile header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/[0.06] lg:hidden flex-shrink-0">
          <h2 className="text-base font-semibold text-brand-green dark:text-brand-green-dark">
            📚 Categories
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            aria-label="Close sidebar"
          >
            <CloseIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Desktop header */}
        <div className={`hidden lg:flex items-center justify-between px-4 py-4 flex-shrink-0 ${isCollapsed ? 'justify-center' : ''}`}>
          {!isCollapsed && (
            <h2 className="text-sm font-semibold tracking-widest uppercase text-gray-400 dark:text-gray-500">
              Categories
            </h2>
          )}
          <button
            onClick={onCollapse}
            className="p-1.5 rounded-lg bg-gray-50 dark:bg-white/5 hover:bg-emerald-50 dark:hover:bg-emerald-950/50
                       text-gray-500 dark:text-gray-400 hover:text-brand-green dark:hover:text-brand-green-dark
                       border border-gray-200 dark:border-white/10 transition-all duration-200"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d={isCollapsed ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'} />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
          {/* All books */}
          <Link
            href="/"
            className={`
              flex items-center gap-3 rounded-xl transition-all duration-200 relative group cursor-pointer
              ${isCollapsed ? 'justify-center px-2 py-3.5' : 'px-3 py-2.5'}
              ${!category
                ? 'bg-gradient-brand text-white shadow-emerald font-semibold'
                : 'text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-white/[0.06] hover:text-brand-green dark:hover:text-brand-green-dark font-medium'}
            `}
            onClick={() => window.innerWidth < 1024 && onClose()}
            title={isCollapsed ? 'All Books' : undefined}
          >
            <span className="text-lg flex-shrink-0">📚</span>
            {!isCollapsed && <span className="text-sm truncate">All Books</span>}
            {isCollapsed && (
              <span className="absolute left-full ml-3 px-2.5 py-1.5 text-xs font-medium text-white
                               bg-gray-900 dark:bg-gray-800 rounded-lg shadow-lg
                               opacity-0 group-hover:opacity-100 transition-opacity
                               pointer-events-none whitespace-nowrap z-50">
                All Books
              </span>
            )}
          </Link>

          {/* Category links */}
          {CATEGORIES.slice(1).map((cat) => {
            const slug = cat.toLowerCase().replace(/\s+/g, '-');
            const isActive = category === slug;
            return (
              <Link
                key={cat}
                href={`/${slug}`}
                className={`
                  flex items-center gap-3 rounded-xl transition-all duration-200 relative group cursor-pointer
                  ${isCollapsed ? 'justify-center px-2 py-3.5' : 'px-3 py-2.5'}
                  ${isActive
                    ? 'bg-gradient-brand text-white shadow-emerald font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-white/[0.06] hover:text-brand-green dark:hover:text-brand-green-dark font-medium'}
                `}
                onClick={() => window.innerWidth < 1024 && onClose()}
                title={isCollapsed ? cat : undefined}
              >
                <span className="text-lg flex-shrink-0">{getCategoryIcon(cat)}</span>
                {!isCollapsed && <span className="text-sm truncate">{cat}</span>}
                {isCollapsed && (
                  <span className="absolute left-full ml-3 px-2.5 py-1.5 text-xs font-medium text-white
                                   bg-gray-900 dark:bg-gray-800 rounded-lg shadow-lg
                                   opacity-0 group-hover:opacity-100 transition-opacity
                                   pointer-events-none whitespace-nowrap z-50">
                    {cat}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer branding */}
        {!isCollapsed && (
          <div className="flex-shrink-0 px-4 py-3 border-t border-gray-100 dark:border-white/[0.06]">
            <p className="text-[10px] font-medium tracking-wider uppercase text-gray-400 dark:text-gray-600 text-center">
              Maududi's Legacy
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;
