"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useRouter, useParams } from 'next/navigation';
import { Book } from '../types';
import BookOpenIcon from './icons/BookOpenIcon';
import ChatIcon from './icons/ChatIcon';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import PdfReaderPanel from './PdfReaderPanel';


interface BookDetailProps {
  book: Book;
  onBack: () => void;
  onStartChat: () => void;
}

const BookDetail: React.FC<BookDetailProps> = ({ book, onBack, onStartChat }) => {
  const router = useRouter();
  const params = useParams();
  const category = (params?.category as string | undefined) || 'all';
  
  const [imageError, setImageError] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      router.push(`/${category}?q=${encodeURIComponent(query)}`);
    }
  }, [router, category, searchQuery]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !pdfOpen) {
        e.stopPropagation();
        onBack();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onBack, pdfOpen]);

  return (
    <>
      <main className="min-h-screen bg-brand-bg-light dark:bg-brand-bg-dark transition-colors duration-300 relative overflow-hidden">
        {/* Cover backdrop blur */}
        {!imageError && (
          <div className="absolute top-0 left-0 right-0 h-[35vh] opacity-[0.08] dark:opacity-[0.15] pointer-events-none select-none overflow-hidden z-0">
            <Image
              src={book.imageUrl}
              alt=""
              fill
              className="object-cover blur-3xl scale-150"
              priority
            />
          </div>
        )}

        <div className="container mx-auto px-4 py-8 max-w-5xl relative z-10 min-h-[calc(100vh-4rem)]">
          {/* Back nav */}
          <motion.button
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onBack}
            className="cursor-pointer inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-xl text-sm font-semibold
                       text-gray-500 dark:text-gray-400
                       hover:text-brand-green dark:hover:text-brand-green-dark
                       hover:bg-emerald-500/10 dark:hover:bg-emerald-500/5
                       border border-transparent hover:border-emerald-500/20
                       transition-all duration-200"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Library
          </motion.button>

          <div className="card-glass p-6 sm:p-8 md:p-10 rounded-3xl shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              {/* Book cover */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="md:col-span-1"
              >
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-gray-200/60 dark:ring-white/10 group">
                  {imageError ? (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2
                                    bg-gradient-to-br from-emerald-50/80 to-cyan-50/80
                                    dark:from-emerald-950/20 dark:to-cyan-950/20">
                      <svg className="w-10 h-10 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span className="text-xs text-gray-400 dark:text-gray-500">No cover available</span>
                    </div>
                  ) : (
                    <Image
                      src={book.imageUrl}
                      alt={book.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      priority
                      onError={() => setImageError(true)}
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
                </div>
              </motion.div>

              {/* Detail content */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
                className="md:col-span-2 flex flex-col justify-between"
              >
                <div>
                  {/* Category pill */}
                  <span className="inline-flex self-start items-center gap-1.5 mb-4 px-3 py-1.5 rounded-full text-xs font-bold
                                   bg-emerald-500/10 dark:bg-emerald-500/5 text-emerald-700 dark:text-emerald-400
                                   border border-emerald-500/20 dark:border-emerald-500/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse-soft" />
                    {book.category}
                  </span>

                  <h1 className="text-3xl sm:text-4xl font-display font-bold leading-tight mb-3
                                 text-gray-900 dark:text-gray-100 tracking-tight">
                    {book.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-6 text-sm">
                    <span className="inline-flex items-center gap-1.5 text-gray-600 dark:text-gray-300 font-medium">
                      <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                      {book.author}
                    </span>
                    <span className="text-gray-300 dark:text-gray-700">|</span>
                    <span className="inline-flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                      <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                      </svg>
                      Published: {book.publicationYear}
                    </span>
                  </div>

                  {/* Description */}
                  <div className="relative mb-8 pl-5 border-l-2 border-brand-green/30 dark:border-brand-green-dark/30">
                    <p className="text-gray-750 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
                      {book.description}
                    </p>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <button
                    onClick={() => setPdfOpen(true)}
                    className="cursor-pointer flex-1 inline-flex items-center justify-center gap-2.5
                               px-6 py-4 rounded-xl font-bold text-sm text-white
                               bg-gradient-brand shadow-lg shadow-emerald-500/20
                               hover:shadow-xl hover:shadow-emerald-500/35 hover:-translate-y-0.5
                               active:scale-[0.98]
                               transition-all duration-200 group"
                  >
                    <BookOpenIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                    <span>Read Book PDF</span>
                  </button>
                  <button
                    onClick={onStartChat}
                    className="cursor-pointer flex-1 inline-flex items-center justify-center gap-2.5
                               px-6 py-4 rounded-xl font-bold text-sm
                               bg-white/50 dark:bg-black/30 text-gray-800 dark:text-gray-200
                               hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20
                               border border-gray-200 dark:border-gray-800
                               shadow-sm hover:shadow-md hover:border-brand-green/45 dark:hover:border-brand-green-dark/45
                               active:scale-[0.98]
                               transition-all duration-200 group"
                  >
                    <ChatIcon className="w-5 h-5 text-gray-400 group-hover:text-brand-green dark:group-hover:text-brand-green-dark transition-colors duration-200" />
                    <span>Chat with AI Context</span>
                  </button>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Search for other books */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="mt-8 pt-6 border-t border-gray-200/50 dark:border-white/[0.04]"
          >
            <form onSubmit={handleSearch} className="relative max-w-md mx-auto">
              <label htmlFor="book-detail-search" className="sr-only">Search for other books</label>
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 dark:text-gray-500">
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
                </svg>
              </div>
              <input
                id="book-detail-search"
                type="search"
                placeholder="Search other books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-black/20
                           border border-gray-200 dark:border-white/10
                           rounded-xl text-sm text-gray-900 dark:text-gray-100
                           placeholder-gray-400 dark:placeholder-gray-500
                           focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green
                           transition-all duration-200"
                autoComplete="off"
              />
            </form>
            <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-2">
              Search across all categories
            </p>
          </motion.div>

          {/* Disclaimer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="mt-12 pt-6 border-t border-gray-200/50 dark:border-white/[0.04]"
          >
            <p className="text-[11px] text-gray-400 dark:text-gray-500 max-w-2xl mx-auto text-center leading-relaxed font-medium">
              Disclaimer: The contents, descriptions, and PDF documents are curated from official domains. 
              Maududi&apos;s Legacy project is dedicated to providing scholarly indexations and does not claim ownership or edit the original scripts.
            </p>
          </motion.div>
        </div>
      </main>

      <PdfReaderPanel
        isOpen={pdfOpen}
        onClose={() => setPdfOpen(false)}
        pdfUrl={book.pdfUrl}
        title={book.title}
      />
    </>
  );
};

export default BookDetail;
