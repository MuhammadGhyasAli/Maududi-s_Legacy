import React, { useEffect, useRef } from 'react';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, setSearchTerm }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  return (
    <div role="search" className="relative group">
      <label htmlFor="book-search" className="sr-only">Search books — press / to focus</label>
      {/* Search icon */}
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 dark:text-gray-500 group-focus-within:text-brand-green transition-colors duration-200">
        <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
        </svg>
      </div>
      <input
        ref={inputRef}
        id="book-search"
        type="text"
        placeholder="Search books by title or topic..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        autoComplete="off"
        className="w-full pl-10 pr-20 py-3 bg-white dark:bg-brand-bg-dark
                   border border-gray-200 dark:border-gray-700
                   rounded-xl text-sm text-gray-900 dark:text-gray-100
                   placeholder-gray-400 dark:placeholder-gray-500
                   shadow-sm hover:shadow-md dark:shadow-black/20
                   focus:shadow-lg dark:focus:shadow-black/30
                   focus:outline-none focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green
                   transition-all duration-200"
      />
      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            aria-label="Clear search"
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        {!searchTerm && (
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold
                         text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800
                         rounded-md border border-gray-200 dark:border-gray-700
                         shadow-sm">
            /
          </kbd>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
