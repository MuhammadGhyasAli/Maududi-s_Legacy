import React, { useMemo } from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  }, [currentPage, totalPages]);

  const btnBase = 'inline-flex items-center justify-center px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer';
  const btnSecondary = 'bg-white dark:bg-brand-card-dark text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/5 hover:border-gray-300 dark:hover:border-gray-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-brand-card-dark disabled:hover:border-gray-200 dark:disabled:hover:border-gray-700';

  return (
    <nav className="mt-12 flex justify-center" aria-label="Pagination">
      <ul className="flex items-center gap-1.5 sm:gap-2">
        <li>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
            className={`${btnBase} ${btnSecondary} gap-1.5`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Previous</span>
          </button>
        </li>
        {pageNumbers.map((number, idx) =>
          typeof number === 'string' ? (
            <li key={`ellipsis-${idx}`}>
              <span className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center text-sm text-gray-400 dark:text-gray-500 select-none">...</span>
            </li>
          ) : (
            <li key={number}>
              <button
                onClick={() => onPageChange(number)}
                aria-label={`Page ${number}`}
                aria-current={currentPage === number ? 'page' : undefined}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                  currentPage === number
                    ? 'bg-gradient-brand text-white shadow-md shadow-emerald-500/20'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {number}
              </button>
            </li>
          )
        )}
        <li>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next page"
            className={`${btnBase} ${btnSecondary} gap-1.5`}
          >
            <span className="hidden sm:inline">Next</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
