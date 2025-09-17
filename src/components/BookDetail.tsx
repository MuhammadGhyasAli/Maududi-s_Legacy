import React from 'react';
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
    <div className="min-h-screen bg-brand-bg-light dark:bg-brand-bg-dark text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <button onClick={onBack} className="flex items-center space-x-2 text-brand-blue dark:text-brand-blue hover:opacity-80 transition-opacity">
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back to Library</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-4xl mx-auto">
          <div className="md:col-span-1">
            <img 
              src={book.imageUrl} 
              alt={book.title} 
              className="w-full h-auto object-cover rounded-lg shadow-lg shadow-gray-300 dark:shadow-black/40"
            />
          </div>

          <div className="md:col-span-2 flex flex-col">
            <h1 className="text-4xl md:text-5xl font-bold text-brand-green dark:text-brand-green-dark mb-2">{book.title}</h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 mb-1">by {book.author}</p>
            <p className="text-md text-gray-500 dark:text-gray-400 mb-6">Published in {book.publicationYear}</p>
            <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-8 flex-grow">
              {book.description}
            </p>

            <div className="mt-auto flex flex-col sm:flex-row gap-3">
               <button 
                onClick={onReadPdf}
                className="flex-1 flex items-center justify-center px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 font-semibold"
              >
                <BookOpenIcon className="w-6 h-6 mr-3" />
                Read PDF
              </button>
              <button 
                onClick={onStartChat}
                className="flex-1 flex items-center justify-center px-6 py-3 bg-brand-blue text-white rounded-lg hover:opacity-90 transition-opacity duration-200 font-semibold"
              >
                <ChatIcon className="w-6 h-6 mr-3" />
                Chat with AI
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Disclaimer: The content and PDF links are sourced from official websites. While we strive for accuracy, discrepancies may exist. We are not responsible for incorrect or mismatched PDF files.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;