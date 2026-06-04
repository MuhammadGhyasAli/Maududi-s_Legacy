import React, { useState } from 'react';
import Image from 'next/image';
import { Book } from '../types';

interface BookCardProps {
  book: Book;
  onClick: (book: Book) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, onClick }) => {
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

  // Category badge color mapping
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
        shadow-card dark:shadow-black/30
        hover:shadow-card-lg hover:-translate-y-1.5 hover:border-emerald-200 dark:hover:border-emerald-800/60
        transition-all duration-300
      "
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-gray-100 dark:bg-brand-navy-mid flex-shrink-0">
        {imageError ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2
                          bg-gradient-to-br from-emerald-50 to-cyan-50
                          dark:from-emerald-950/30 dark:to-cyan-950/30">
            <span className="text-4xl" aria-hidden="true">📖</span>
            <span className="text-xs text-gray-400 dark:text-gray-500">No cover</span>
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
              className={`object-cover group-hover:scale-105 transition-all duration-500 relative z-10
                          ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          </>
        )}

        {/* Overlay gradient on image */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent
                        group-hover:from-black/15 transition-all duration-300" />

        {/* Category badge on image */}
        <span className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-semibold
                          backdrop-blur-sm ${badgeClass}`}>
          {book.category}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-sm font-bold leading-snug mb-0.5
                       text-gray-900 dark:text-gray-100
                       group-hover:text-brand-green dark:group-hover:text-brand-green-dark
                       transition-colors duration-200 line-clamp-2">
          {book.title}
        </h3>
        <p className="text-xs font-medium text-gray-400 dark:text-gray-500 mb-2">
          {book.author} · {book.publicationYear}
        </p>

        <div className="flex-grow flex flex-col">
          <p className={`text-xs text-gray-500 dark:text-gray-400 leading-relaxed
                         ${!isExpanded && needsExpansion ? 'line-clamp-3' : ''}`}>
            {book.description}
          </p>
          <div className="flex-grow" />
          {needsExpansion && (
            <button
              onClick={toggleExpand}
              aria-expanded={isExpanded}
              className="mt-2 text-[11px] font-semibold text-brand-green dark:text-brand-green-dark
                         hover:underline cursor-pointer self-start"
            >
              {isExpanded ? 'Read less ↑' : 'Read more ↓'}
            </button>
          )}
        </div>
      </div>

      {/* Bottom accent line on hover */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5
                      bg-gradient-brand opacity-0 group-hover:opacity-100
                      transition-opacity duration-300" />
    </div>
  );
};

export default BookCard;
