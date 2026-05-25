import React from 'react';
import Image from 'next/image';
import { Book } from '../types';
import BookOpenIcon from './icons/BookOpenIcon';
import ChatIcon from './icons/ChatIcon';
import ArrowLeftIcon from './icons/ArrowLeftIcon';

interface BookDetailProps {
  book: Book;
  onBack: () => void;
  onReadPdf: () => void;
  onStartChat: () => void;
}

const BookDetail: React.FC<BookDetailProps> = ({ book, onBack, onReadPdf, onStartChat }) => {
  return (
    <div className="min-h-screen bg-brand-bg-light dark:bg-brand-bg-dark transition-colors duration-300">
      <div className="container mx-auto px-4 py-8 max-w-5xl">

        {/* Back nav */}
        <button
          onClick={onBack}
          className="cursor-pointer inline-flex items-center gap-2 mb-8 px-3 py-1.5 rounded-xl text-sm font-medium
                     text-brand-green dark:text-brand-green-dark
                     hover:bg-emerald-50 dark:hover:bg-emerald-950/40
                     border border-emerald-200/60 dark:border-emerald-800/40
                     transition-all duration-200"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Library
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">

          {/* Book cover */}
          <div className="md:col-span-1">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-card-lg dark:shadow-black/50 ring-1 ring-gray-200/60 dark:ring-white/10">
              <Image
                src={book.imageUrl}
                alt={book.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
                loading="lazy"
              />
              {/* Subtle shimmer overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
            </div>
          </div>

          {/* Detail content */}
          <div className="md:col-span-2 flex flex-col">
            {/* Category pill */}
            <span className="inline-flex self-start mb-4 px-3 py-1 rounded-full text-xs font-semibold
                             bg-emerald-100 text-brand-green dark:bg-emerald-900/40 dark:text-brand-green-dark
                             border border-emerald-200 dark:border-emerald-800/50">
              {book.category}
            </span>

            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-2
                           text-gray-900 dark:text-gray-100">
              {book.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-6 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-medium">by {book.author}</span>
              <span className="text-gray-300 dark:text-gray-600">·</span>
              <span>{book.publicationYear}</span>
            </div>

            {/* Description */}
            <div className="relative mb-8 flex-grow">
              <div className="absolute -left-4 top-0 bottom-0 w-0.5 rounded-full bg-gradient-brand opacity-60" />
              <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed pl-2">
                {book.description}
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-auto">
              <button
                onClick={onReadPdf}
                className="cursor-pointer flex-1 inline-flex items-center justify-center gap-2.5
                           px-6 py-3.5 rounded-xl font-semibold text-sm
                           bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-200
                           hover:bg-gray-200 dark:hover:bg-white/15
                           border border-gray-200 dark:border-white/10
                           transition-all duration-200 group"
              >
                <BookOpenIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                Read PDF
              </button>

              <button
                onClick={onStartChat}
                className="cursor-pointer flex-1 inline-flex items-center justify-center gap-2.5
                           px-6 py-3.5 rounded-xl font-semibold text-sm text-white
                           bg-gradient-brand shadow-emerald
                           hover:shadow-lg hover:-translate-y-0.5
                           transition-all duration-200 group"
              >
                <ChatIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                Chat with AI
              </button>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 pt-6 border-t border-gray-200/60 dark:border-white/[0.06]">
          <p className="text-xs text-gray-400 dark:text-gray-600 max-w-2xl mx-auto text-center leading-relaxed">
            Disclaimer: The content and PDF links are sourced from official websites. While we strive for accuracy,
            discrepancies may exist. We are not responsible for incorrect or mismatched PDF files.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
