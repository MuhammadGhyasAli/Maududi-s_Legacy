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
  'Tafsir':        'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
  'Politics':      'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  'Theology':      'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
  'Economics':     'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
  'Jurisprudence': 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
  'Social Issues': 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400',
  'History':       'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
  'Guidance':      'bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400',
};

function BookCardInner({ book, onClick, priority }: BookCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  React.useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setImageLoaded(true);
    }
  }, []);

  const badgeClass = categoryColors[book.category] || 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-300';

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
        rounded-xl overflow-hidden text-left
        border border-gray-100 dark:border-white/[0.06]
        shadow-sm hover:shadow-md
        hover:border-gray-200 dark:hover:border-white/10
        transition-all duration-200
      "
    >
      <div className="relative aspect-[3/4] max-h-44 overflow-hidden bg-gray-50 dark:bg-brand-navy-mid flex-shrink-0">
        {imageError ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2
                          bg-gray-50 dark:bg-gray-800/50">
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
              className={`object-cover group-hover:scale-105 transition-all duration-500
                          ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              loading={priority ? undefined : 'lazy'}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          </>
        )}

        <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-md text-[10px] font-medium shadow-sm ${badgeClass}`}>
          {book.category}
        </span>
      </div>

      <div className="p-3.5 flex flex-col flex-grow">
        <h3 className="text-sm font-semibold leading-snug mb-0.5
                       text-gray-900 dark:text-gray-100
                       line-clamp-2">
          {book.title}
        </h3>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">
          {book.author} <span className="text-gray-300 dark:text-gray-600">·</span> {book.publicationYear}
        </p>

        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
          {book.description}
        </p>
      </div>
    </div>
  );
}

const BookCard = React.memo(BookCardInner);
export default BookCard;
