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

  const btnBase = 'px-3 sm:px-4 py-2 rounded-md text-sm transition-colors';
  const btnActive = 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <nav className="mt-12 flex justify-center" aria-label="Pagination">
      <ul className="flex items-center gap-1 sm:gap-2">
        <li>
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
            className={`${btnBase} ${btnActive}`}
          >
            <span className="hidden sm:inline"><span aria-hidden="true">&larr;</span> Previous</span>
            <span className="sm:hidden" aria-hidden="true">&larr;</span>
          </button>
        </li>
        {pageNumbers.map((number, idx) =>
          typeof number === 'string' ? (
            <li key={`ellipsis-${idx}`}>
              <span className="px-1 sm:px-2 text-gray-400 dark:text-gray-500 select-none">...</span>
            </li>
          ) : (
            <li key={number}>
              <button
                onClick={() => onPageChange(number)}
                aria-label={`Page ${number}`}
                aria-current={currentPage === number ? 'page' : undefined}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-md text-sm transition-colors ${
                  currentPage === number
                    ? 'bg-brand-blue text-white font-bold'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
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
            className={`${btnBase} ${btnActive}`}
          >
            <span className="hidden sm:inline">Next <span aria-hidden="true">&rarr;</span></span>
            <span className="sm:hidden" aria-hidden="true">&rarr;</span>
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
