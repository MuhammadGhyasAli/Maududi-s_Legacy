import React, { useEffect } from 'react';
import { Book } from '../types';
import CloseIcon from './icons/CloseIcon';
import BookOpenIcon from './icons/BookOpenIcon';

interface BookDetailModalProps {
  book: Book | null;
  onClose: () => void;
  onNavigate: (book: Book) => void;
}

const BookDetailModal: React.FC<BookDetailModalProps> = ({ book, onClose, onNavigate }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  if (!book) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in-up"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-brand-green dark:text-brand-green-dark">Book Details</h2>
          <button onClick={onClose} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" aria-label="Close modal">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-shrink-0 sm:w-1/3">
              <img src={book.imageUrl} alt={book.title} className="w-full h-auto object-cover rounded-md shadow-md" />
            </div>
            <div className="flex-grow">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{book.title}</h3>
              <p className="text-md text-gray-500 dark:text-gray-400 mt-1">by {book.author}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Published in {book.publicationYear}</p>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-6">
                {book.description}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end items-center p-4 mt-auto border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md font-semibold hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
          >
            Dismiss
          </button>
          <button
            onClick={() => onNavigate(book)}
            className="flex items-center justify-center px-4 py-2 bg-brand-blue text-white rounded-md font-semibold hover:opacity-90 transition-opacity"
          >
            <BookOpenIcon className="w-5 h-5 mr-2" />
            View Full Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookDetailModal;