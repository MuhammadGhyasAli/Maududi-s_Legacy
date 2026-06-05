'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Book } from '../types';

interface BookCardProps {
  book: Book;
  onClick: (book: Book) => void;
  priority?: boolean;
}

const categoryColors: Record<string, string> = {
  'Tafsir':        'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  'Politics':      'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'Theology':      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  'Economics':     'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  'Jurisprudence': 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  'Social Issues': 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  'History':       'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  'Guidance':      'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
};

function BookCardInner({ book, onClick, priority }: BookCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setImageLoaded(true);
    }
  }, []);

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const needsExpansion = book.description.length > 150;
  const badgeClass = categoryColors[book.category] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';

  return (
    <div
      onClick={() => onClick(book)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(book); } }}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${book.title}`}
      className="
        group relative flex flex-col cursor-pointer
        bg-white dark:bg-brand-card-dark
        rounded-2xl overflow-hidden text-left
        border border-gray-100 dark:border-white/[0.07]
        shadow-sm hover:shadow-xl dark:shadow-black/20 dark:hover:shadow-black/40
        hover:shadow-emerald-500/5 dark:hover:shadow-emerald-500/10
        hover:-translate-y-1.5 hover:border-emerald-200/80 dark:hover:border-emerald-700/60
        active:scale-[0.98] active:shadow-md
        transition-all duration-300 ease-out
      "
    >
      <div className="relative aspect-[3/4] max-h-48 overflow-hidden bg-gray-100 dark:bg-brand-navy-mid flex-shrink-0">
        {imageError ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2
                          bg-gradient-to-br from-emerald-50/80 to-cyan-50/80
                          dark:from-emerald-950/20 dark:to-cyan-950/20">
            <svg className="w-8 h-8 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-[10px] text-gray-400 dark:text-gray-500">No cover</span>
          </div>
        ) : (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 skeleton-shimmer" />
            )}
            <Image
              ref={imgRef}
              src={book.imageUrl}
              alt={book.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1280px) 33vw, 20vw"
              priority={priority}
              className={`object-cover group-hover:scale-105 transition-all duration-700 ease-out relative z-10
                          ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              loading={priority ? undefined : 'lazy'}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          </>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent
                        group-hover:from-black/20 transition-all duration-300" />

        <span className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-semibold
                          backdrop-blur-md shadow-sm ${badgeClass}`}>
          {book.category}
        </span>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-sm font-bold leading-snug mb-0.5
                       text-gray-900 dark:text-gray-100
                       group-hover:text-brand-green dark:group-hover:text-brand-green-dark
                       transition-colors duration-200 line-clamp-2">
          {book.title}
        </h3>
        <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-2">
          {book.author} <span className="text-gray-300 dark:text-gray-600">·</span> {book.publicationYear}
        </p>

        <div className="flex-grow flex flex-col">
          <p className={`text-xs text-gray-500 dark:text-gray-400 leading-relaxed
                         ${!isExpanded && needsExpansion ? 'line-clamp-3' : ''}`}>
            {book.description}
          </p>
          {needsExpansion && (
            <button
              onClick={toggleExpand}
              aria-expanded={isExpanded}
              className="mt-2 text-[11px] font-semibold text-brand-green dark:text-brand-green-dark
                         hover:text-brand-green-light transition-colors cursor-pointer self-start"
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full
                      bg-gradient-brand opacity-0 group-hover:opacity-100
                      transition-all duration-300 scale-x-0 group-hover:scale-x-100" />
    </div>
  );
}

const BookCard = React.memo(BookCardInner);
export default BookCard;
