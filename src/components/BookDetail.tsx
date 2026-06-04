"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Book } from '../types';
import ChatIcon from './icons/ChatIcon';
import ArrowLeftIcon from './icons/ArrowLeftIcon';

interface BookDetailProps {
  book: Book;
  onBack: () => void;
  onStartChat: () => void;
}

const BookDetail: React.FC<BookDetailProps> = ({ book, onBack, onStartChat }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <>
      <div className="min-h-screen bg-brand-bg-light dark:bg-brand-bg-dark transition-colors duration-300">
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

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-8 text-sm">
                <span className="font-medium text-gray-600 dark:text-gray-400">by {book.author}</span>
                <span className="text-gray-300 dark:text-gray-600">·</span>
                <span className="text-gray-500 dark:text-gray-500">{book.publicationYear}</span>
                <span className="text-gray-300 dark:text-gray-600">·</span>
                <span className="inline-flex items-center gap-1 text-gray-500 dark:text-gray-500">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
                  </svg>
                  English · Urdu
                </span>
                <span className="text-gray-300 dark:text-gray-600">·</span>
                <span className="text-gray-500 dark:text-gray-500">
                  ~{Math.max(50, Math.ceil(book.description.split(/\s+/).length * 1.5))} pages
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
                  onClick={onStartChat}
                  className="cursor-pointer flex-1 inline-flex items-center justify-center gap-2.5
                             px-6 py-3.5 rounded-xl font-semibold text-sm text-white
                             bg-gradient-brand shadow-md shadow-emerald-500/20
                             hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5
                             active:scale-[0.98]
                             transition-all duration-200 group"
                >
                  <ChatIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
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
      </div>
    </>
  );
};

export default BookDetail;
