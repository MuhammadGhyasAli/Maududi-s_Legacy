"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
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
  const [imageError, setImageError] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);

  return (
    <>
      <main className="min-h-screen bg-brand-bg-light dark:bg-brand-bg-dark transition-colors duration-300">
        <div className="container mx-auto px-4 py-8 max-w-5xl">

          {/* Back nav */}
          <motion.button
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onBack}
            className="cursor-pointer inline-flex items-center gap-2 mb-8 px-3 py-1.5 rounded-xl text-sm font-medium
                       text-gray-500 dark:text-gray-400
                       hover:text-brand-green dark:hover:text-brand-green-dark
                       hover:bg-emerald-50 dark:hover:bg-emerald-950/30
                       transition-all duration-200"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Library
          </motion.button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">

            {/* Book cover */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="md:col-span-1"
            >
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg dark:shadow-black/40 ring-1 ring-gray-200/60 dark:ring-white/10">
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
                    className="object-cover"
                    loading="lazy"
                    onError={() => setImageError(true)}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              </div>
            </motion.div>

            {/* Detail content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' }}
              className="md:col-span-2 flex flex-col"
            >
              {/* Category pill */}
              <span className="inline-flex self-start items-center gap-1.5 mb-4 px-3 py-1 rounded-full text-xs font-semibold
                               bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300
                               border border-emerald-200 dark:border-emerald-800/50">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                {book.category}
              </span>

              <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-3
                             text-gray-900 dark:text-gray-100">
                {book.title}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-8 text-sm">
                <span className="inline-flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  {book.author}
                </span>
                <span className="inline-flex items-center gap-1.5 text-gray-500 dark:text-gray-500">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                  {book.publicationYear}
                </span>

              </div>

              {/* Description */}
              <div className="relative mb-8 flex-grow">
                <div className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-gradient-brand opacity-40" />
                <div className="pl-5">
                  <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
                    {book.description}
                  </p>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                <button
                  onClick={() => setPdfOpen(true)}
                  className="cursor-pointer flex-1 inline-flex items-center justify-center gap-2.5
                             px-6 py-3.5 rounded-xl font-semibold text-sm text-white
                             bg-gradient-brand shadow-md shadow-emerald-500/20
                             hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5
                             active:scale-[0.98]
                             transition-all duration-200 group"
                >
                  <BookOpenIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                  <span>Read PDF</span>
                </button>
                <button
                  onClick={onStartChat}
                  className="cursor-pointer flex-1 inline-flex items-center justify-center gap-2.5
                             px-6 py-3.5 rounded-xl font-semibold text-sm
                             bg-white dark:bg-brand-card-dark text-gray-800 dark:text-gray-200
                             hover:bg-gray-50 dark:hover:bg-white/5
                             border border-gray-200 dark:border-gray-700
                             shadow-sm hover:shadow-md
                             active:scale-[0.98]
                             transition-all duration-200 group"
                >
                  <ChatIcon className="w-5 h-5 text-gray-400 group-hover:text-brand-green dark:group-hover:text-brand-green-dark transition-colors duration-200" />
                  <span>Chat with AI</span>
                </button>
              </div>
            </motion.div>
          </div>

          {/* Disclaimer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-14 pt-6 border-t border-gray-200/60 dark:border-white/[0.06]"
          >
            <p className="text-xs text-gray-400 dark:text-gray-600 max-w-2xl mx-auto text-center leading-relaxed">
              Disclaimer: The content and PDF links are sourced from official websites. While we strive for accuracy,
              discrepancies may exist. We are not responsible for incorrect or mismatched PDF files.
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
