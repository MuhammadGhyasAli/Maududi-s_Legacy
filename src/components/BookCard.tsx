import React, { useState } from 'react';
import { Book } from '../types';

interface BookCardProps {
  book: Book;
  onClick: (book: Book) => void;
}

const BookCard: React.FC<BookCardProps> = ({ book, onClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  // Only show the button if the description is long enough to be clamped
  const needsExpansion = book.description.length > 150;

  return (
    <button 
      onClick={() => onClick(book)}
      className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg shadow-gray-200 dark:shadow-black/30 flex flex-col transform hover:-translate-y-2 transition-transform duration-300 border border-gray-200 dark:border-gray-700 text-left group"
    >
      <div className="relative">
        <img src={book.imageUrl} alt={book.title} className="w-full h-80 object-cover" />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 dark:bg-black/40 dark:group-hover:bg-black/20 transition-colors duration-300"></div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-brand-green dark:text-brand-green-dark group-hover:text-brand-blue dark:group-hover:text-brand-blue transition-colors duration-300 leading-tight">{book.title}</h3>
        <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">{book.author}</p>
        
        <div className="mt-2 flex-grow flex flex-col">
          <p className={`text-sm text-gray-600 dark:text-gray-400 ${!isExpanded && needsExpansion ? 'line-clamp-3' : ''}`}>
            {book.description}
          </p>
          
          <div className="flex-grow" />
          
          {needsExpansion && (
            <button
              onClick={toggleExpand}
              className="text-brand-blue dark:text-brand-blue text-sm font-semibold mt-2 self-start hover:underline focus:outline-none"
              aria-expanded={isExpanded}
            >
              {isExpanded ? 'Read Less' : 'Read More'}
            </button>
          )}
        </div>
      </div>
    </button>
  );
};

export default BookCard;