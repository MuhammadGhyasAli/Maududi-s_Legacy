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
        bg-white/70 dark:bg-brand-card-dark/65
        backdrop-blur-md
        rounded-2xl overflow-hidden text-left
        border border-white/50 dark:border-white/[0.06]
        shadow-sm hover:shadow-2xl dark:shadow-black/25 dark:hover:shadow-black/45
        hover:shadow-emerald-500/5 dark:hover:shadow-emerald-500/10
        hover:-translate-y-2 hover:border-brand-green/35 dark:hover:border-brand-green-dark/35
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
              className={`object-cover group-hover:scale-110 transition-all duration-700 ease-out relative z-10
                          ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              loading={priority ? undefined : 'lazy'}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          </>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent
                        group-hover:from-black/30 transition-all duration-300 z-10" />

        {/* Hover Quick Actions Overlay */}
        <div className="absolute inset-0 z-20 flex items-center justify-center gap-3 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-xs">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick(book);
            }}
            className="p-2.5 rounded-xl bg-white text-gray-900 hover:bg-brand-green hover:text-white transition-all duration-200 transform translate-y-3 group-hover:translate-y-0 shadow-lg cursor-pointer"
            title="Read Details & PDF"
          >
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              const bookSlug = book.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
              const categorySlug = book.category.toLowerCase().replace(/\s+/g, '-');
              window.location.href = `/${categorySlug}/${bookSlug}/chat`;
            }}
            className="p-2.5 rounded-xl bg-white text-gray-900 hover:bg-brand-green hover:text-white transition-all duration-200 transform translate-y-3 group-hover:translate-y-0 shadow-lg cursor-pointer"
            title="Chat with AI"
          >
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a.596.596 0 0 1-.508-.074.597.597 0 0 1-.219-.48c.032-.614.215-1.727.838-2.614C4.121 16.598 3 14.414 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
            </svg>
          </button>
        </div>

        <span className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-semibold
                          backdrop-blur-md shadow-sm z-20 ${badgeClass}`}>
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
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-2">
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
              className="mt-2 text-[11px] font-bold text-brand-green dark:text-brand-green-dark
                         hover:text-brand-green-light transition-colors cursor-pointer self-start"
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1
                      bg-gradient-brand opacity-0 group-hover:opacity-100
                      transition-all duration-300 scale-x-0 group-hover:scale-x-100" />
    </div>
  );
}

const BookCard = React.memo(BookCardInner);
export default BookCard;
