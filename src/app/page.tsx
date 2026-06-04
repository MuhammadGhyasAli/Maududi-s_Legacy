'use client';

import React, { Suspense, useEffect, useState, useRef } from "react";
import BookGrid from "../components/BookGrid";
import { apiService } from "../services/apiService";
import type { Book } from "../types";

function HomePageFallback() {
  return (
    <main className="flex-1 container mx-auto px-4 py-8">
      <div className="relative text-center max-w-3xl mx-auto mb-8">
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
          <svg className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] opacity-[0.03] dark:opacity-[0.04]" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="300" cy="300" r="280" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="300" cy="300" r="220" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="300" cy="300" r="160" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="300" cy="300" r="100" stroke="currentColor" strokeWidth="0.5" />
            <line x1="20" y1="300" x2="580" y2="300" stroke="currentColor" strokeWidth="0.3" />
            <line x1="300" y1="20" x2="300" y2="580" stroke="currentColor" strokeWidth="0.3" />
            <line x1="102" y1="102" x2="498" y2="498" stroke="currentColor" strokeWidth="0.3" />
            <line x1="498" y1="102" x2="102" y2="498" stroke="currentColor" strokeWidth="0.3" />
            <polygon points="300,50 420,180 380,320 220,320 180,180" stroke="currentColor" strokeWidth="0.4" fill="none" />
            <polygon points="300,550 420,420 380,280 220,280 180,420" stroke="currentColor" strokeWidth="0.4" fill="none" />
            <circle cx="300" cy="300" r="40" stroke="currentColor" strokeWidth="0.4" fill="none" />
          </svg>
        </div>
        <div className="skeleton-shimmer mx-auto rounded-full h-7 w-48 mb-5" />
        <div className="skeleton-shimmer mx-auto rounded h-14 w-3/4 mb-4" />
        <div className="skeleton-shimmer mx-auto rounded h-5 w-2/3" />
      </div>
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {['Tafsir', 'Politics', 'Theology', 'Economics', 'Jurisprudence', 'History'].map(cat => (
          <div key={cat} className="skeleton-shimmer rounded-full h-8 w-20" />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {[...Array(15)].map((_, i) => (
          <div key={i} className={`animate-fade-in-scale-delay-${Math.min((i % 5) + 1, 5)}`}>
            <div className="bg-white dark:bg-brand-card-dark rounded-2xl overflow-hidden border border-gray-100 dark:border-white/[0.07] shadow-sm">
              <div className="skeleton-shimmer rounded w-full aspect-[3/4] max-h-48" />
              <div className="p-4 space-y-2.5">
                <div className="skeleton-shimmer rounded h-4 w-4/5" />
                <div className="skeleton-shimmer rounded h-3 w-1/3" />
                <div className="pt-1.5 space-y-1.5">
                  <div className="skeleton-shimmer rounded h-2.5 w-full" />
                  <div className="skeleton-shimmer rounded h-2.5 w-2/3" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

function HomePageContent() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    (async () => {
      try {
        const fetched = await apiService.getBooks();
        setBooks(fetched);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load books');
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <HomePageFallback />;
  }

  if (error) {
    return (
      <main className="flex-1 container mx-auto px-4 py-16 flex items-center justify-center">
        <div className="max-w-md w-full bg-white dark:bg-brand-card-dark rounded-2xl p-8 text-center
                        border border-amber-200 dark:border-amber-800/40
                        shadow-card dark:shadow-black/30">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-5">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Backend Unreachable
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 leading-relaxed">{error}</p>
          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-900/20
                        rounded-lg px-3 py-2 border border-amber-200/60 dark:border-amber-700/40">
            Books are loaded directly from the server — no external backend needed
          </p>
        </div>
      </main>
    );
  }

  return <BookGrid books={books} />;
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomePageFallback />}>
      <HomePageContent />
    </Suspense>
  );
}
