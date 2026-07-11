'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiService } from '../services/apiService';
import { CATEGORIES } from '../constants';
import { slugify } from '../utils/slugify';

const categoryLinks = CATEGORIES.filter(c => c !== 'All').map(name => ({
  name,
  href: `/${slugify(name)}`,
}));

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [bookCount, setBookCount] = useState(0);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    apiService.getBooks().then((books: { category: string }[]) => {
      setBookCount(books.length);
      const counts: Record<string, number> = {};
      books.forEach((b: { category: string }) => {
        counts[b.category] = (counts[b.category] || 0) + 1;
      });
      setCategoryCounts(counts);
    }).catch(() => {});
  }, []);

  const linkClass =
    'text-sm text-gray-500 dark:text-gray-400 hover:text-brand-green dark:hover:text-brand-green-dark transition-colors duration-200';

  return (
    <footer className="w-full bg-white dark:bg-brand-bg-dark border-t border-gray-200/60 dark:border-white/[0.06] mt-auto">
      <div className="h-px bg-gray-200 dark:bg-white/10" />

      <div className="container mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-12 gap-8 md:gap-6">
          {/* Brand — 4 cols */}
          <div className="col-span-2 md:col-span-4 space-y-4">
            <h3 className="font-display font-bold text-lg text-brand-green dark:text-brand-green-dark">
              Maududi&apos;s Legacy
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs">
              A digital archive preserving and providing intelligent access to the works of Sayyid Abul A&apos;la Maududi.
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/40">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>{bookCount || '—'} works</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <span>{CATEGORIES.length - 1} categories</span>
              </span>
            </div>
          </div>

          {/* Browse — 2 cols */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <h4 className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 dark:text-gray-500">
              Browse
            </h4>
            <ul className="space-y-2.5">
              {[
                { href: '/', label: 'All Books' },
                { href: '/ai-context-finder', label: 'AI Search' },
                { href: '/biography', label: 'Biography' },
                { href: '/about', label: 'About' },
              ].map(link => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories — 4 cols */}
          <div className="col-span-2 md:col-span-4 space-y-4">
            <h4 className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 dark:text-gray-500">
              Categories
            </h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
              {categoryLinks.map((cat) => (
                <Link key={cat.name} href={cat.href} className={linkClass}>
                  {cat.name}
                  {categoryCounts[cat.name] !== undefined && (
                    <span className="ml-1 text-gray-300 dark:text-gray-600">({categoryCounts[cat.name]})</span>
                  )}
                </Link>
              ))}
            </div>
          </div>

          {/* Project — 2 cols */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <h4 className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 dark:text-gray-500">
              Project
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a href="https://github.com/MuhammadGhyasAli/Maududi-s_Legacy" target="_blank" rel="noopener noreferrer"
                   className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-brand-green dark:hover:text-brand-green-dark transition-colors duration-200">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                  Source Code
                </a>
              </li>
              <li><Link href="/privacy" className={linkClass}>Privacy Policy</Link></li>
              <li><Link href="/terms" className={linkClass}>Terms of Service</Link></li>
              <li><span className="text-sm text-gray-400 dark:text-gray-500">Open Source · MIT</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-5 border-t border-gray-100 dark:border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            &copy; {currentYear} Maududi&apos;s Legacy Project
          </p>
          <p className="text-[11px] text-gray-400 dark:text-gray-600">
            Built with Next.js · FastAPI · Groq AI
          </p>
        </div>
      </div>
    </footer>
  );
}
