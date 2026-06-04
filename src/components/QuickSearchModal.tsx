"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Book } from '../types';
import { apiService } from '../services/apiService';

const QuickSearchModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Book[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [books, setBooks] = useState<Book[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    apiService.getBooks().then(setBooks).catch(() => {});
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(o => !o);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults(books.slice(0, 8));
      setSelectedIdx(0);
      return;
    }
    const lower = query.toLowerCase();
    const filtered = books.filter(b =>
      b.title.toLowerCase().includes(lower) ||
      b.author.toLowerCase().includes(lower) ||
      b.category.toLowerCase().includes(lower) ||
      b.description.toLowerCase().includes(lower)
    ).slice(0, 10);
    setResults(filtered);
    setSelectedIdx(0);
  }, [query, books]);

  const navigate = useCallback((book: Book) => {
    setIsOpen(false);
    const catSlug = book.category?.toLowerCase().replace(/\s+/g, '-') || 'all';
    const bookSlug = book.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
    router.push(`/${catSlug}/${bookSlug}`);
  }, [router]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIdx]) {
      e.preventDefault();
      navigate(results[selectedIdx]);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              transition={{ duration: 0.15 }}
              className="pointer-events-auto w-full max-w-xl bg-white dark:bg-brand-card-dark rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden"
            >
              <div className="flex items-center gap-3 px-4 border-b border-gray-100 dark:border-white/[0.06]">
                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search all books…"
                  className="flex-1 py-4 bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none"
                  role="combobox"
                  aria-expanded={results.length > 0}
                  aria-controls="quick-search-listbox"
                  aria-autocomplete="list"
                />
                <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 shrink-0">
                  Esc
                </kbd>
              </div>
              <div id="quick-search-listbox" className="max-h-80 overflow-y-auto p-2" role="listbox">
                {results.length === 0 ? (
                  <div className="px-3 py-8 text-center text-sm text-gray-400 dark:text-gray-500">
                    No books found
                  </div>
                ) : (
                  results.map((book, idx) => (
                    <button
                      key={book.id}
                      role="option"
                      aria-selected={idx === selectedIdx}
                      onClick={() => navigate(book)}
                      onMouseEnter={() => setSelectedIdx(idx)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                        idx === selectedIdx
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-brand-green dark:text-brand-green-dark'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="w-8 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-brand-navy-mid flex-shrink-0">
                        <Image src={book.imageUrl} alt="" width={32} height={40} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className={`text-sm font-medium truncate ${idx === selectedIdx ? 'text-brand-green dark:text-brand-green-dark' : 'text-gray-900 dark:text-gray-100'}`}>
                          {book.title}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 truncate">
                          {book.author} · {book.category}
                        </div>
                      </div>
                      <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 shrink-0">
                        {book.publicationYear}
                      </span>
                    </button>
                  ))
                )}
              </div>
              {results.length > 0 && (
                <div className="px-4 py-2 border-t border-gray-100 dark:border-white/[0.06] flex items-center gap-4 text-[10px] text-gray-400 dark:text-gray-500">
                  <span><kbd className="inline-flex items-center px-1 py-0.5 text-[9px] font-semibold bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 mr-1">↑</kbd><kbd className="inline-flex items-center px-1 py-0.5 text-[9px] font-semibold bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 mr-1">↓</kbd> navigate</span>
                  <span><kbd className="inline-flex items-center px-1 py-0.5 text-[9px] font-semibold bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 mr-1">⏎</kbd> open</span>
                  <span><kbd className="inline-flex items-center px-1 py-0.5 text-[9px] font-semibold bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 mr-1">⌘K</kbd> toggle</span>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default QuickSearchModal;
