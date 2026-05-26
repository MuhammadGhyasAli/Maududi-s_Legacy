'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiService } from '../services/apiService';

const CATEGORIES = [
  { name: 'Tafsir', href: '/tafsir', icon: '📖' },
  { name: 'Theology', href: '/theology', icon: '☝️' },
  { name: 'Politics', href: '/politics', icon: '🏛️' },
  { name: 'Economics', href: '/economics', icon: '💰' },
  { name: 'Jurisprudence', href: '/jurisprudence', icon: '⚖️' },
  { name: 'History', href: '/history', icon: '📜' },
  { name: 'Social Issues', href: '/social-issues', icon: '🤝' },
  { name: 'Guidance', href: '/guidance', icon: '💡' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [bookCount, setBookCount] = useState(0);

  useEffect(() => {
    apiService.getBooks().then((books) => setBookCount(books.length)).catch(() => {});
  }, []);

  const linkClass =
    'text-sm text-gray-500 dark:text-gray-400 hover:text-brand-green dark:hover:text-brand-green-dark transition-colors duration-200';

  return (
    <footer className="w-full bg-white dark:bg-brand-bg-dark border-t border-gray-200/60 dark:border-white/[0.06] mt-auto">
      {/* Top accent */}
      <div className="h-0.5 bg-gradient-brand" />

      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Brand — 4 cols */}
          <div className="sm:col-span-2 lg:col-span-4 space-y-4">
            <h3 className="font-display font-bold text-xl text-brand-green dark:text-brand-green-dark">
              Maududi&apos;s Legacy
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">
              A digital archive preserving and providing intelligent access to the works of Sayyid Abul A&apos;la Maududi.
            </p>
            <div className="flex items-center gap-3 text-xs font-medium text-gray-500 dark:text-gray-400">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40">
                <span>📚</span>
                <span>{bookCount || '73'} works</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40">
                <span>📂</span>
                <span>{CATEGORIES.length} categories</span>
              </span>
            </div>
          </div>

          {/* Browse — 2 cols */}
          <div className="sm:col-span-1 lg:col-span-2 space-y-4">
            <h4 className="text-[11px] font-semibold tracking-widest uppercase text-gray-400 dark:text-gray-500">
              Browse
            </h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className={linkClass}>All Books</Link>
              </li>
              <li>
                <Link href="/ai-context-finder" className={linkClass}>AI Search</Link>
              </li>
              <li>
                <Link href="/biography" className={linkClass}>Biography</Link>
              </li>
              <li>
                <Link href="/about" className={linkClass}>About</Link>
              </li>
            </ul>
          </div>

          {/* Categories — 4 cols */}
          <div className="sm:col-span-2 lg:col-span-4 space-y-4">
            <h4 className="text-[11px] font-semibold tracking-widest uppercase text-gray-400 dark:text-gray-500">
              Categories
            </h4>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              {CATEGORIES.map((cat) => (
                <Link key={cat.name} href={cat.href} className={linkClass}>
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Project — 2 cols */}
          <div className="sm:col-span-1 lg:col-span-2 space-y-4">
            <h4 className="text-[11px] font-semibold tracking-widest uppercase text-gray-400 dark:text-gray-500">
              Project
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://github.com/MuhammadGhyasAli/Maududi-s_Legacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  Source Code
                </a>
              </li>
              <li>
                <span className="text-sm text-gray-400 dark:text-gray-500">
                  Open Source &middot; MIT
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-6 border-t border-gray-200/60 dark:border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            &copy; {currentYear} Maududi&apos;s Legacy Project
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-600">
            Built with Next.js &middot; FastAPI &middot; Groq AI
          </p>
        </div>
      </div>
    </footer>
  );
}
