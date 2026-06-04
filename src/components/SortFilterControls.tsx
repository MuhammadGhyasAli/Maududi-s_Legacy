import React from 'react';

interface SortFilterControlsProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  sortBy: string;
  onSortByChange: (sort: string) => void;
  totalBooks: number;
  viewMode: 'grid' | 'list';
  onViewModeChange: (view: 'grid' | 'list') => void;
}

const SortFilterControls: React.FC<SortFilterControlsProps> = ({
  totalBooks,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortByChange,
}) => {
  return (
    <div className="my-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-semibold text-gray-900 dark:text-gray-100">{totalBooks}</span> books found
        </div>

        <div className="flex-shrink-0 md:w-48 md:mr-10">
          <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 block">
            View as
          </span>
          <div className="flex space-x-2" role="group" aria-label="View mode">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-3 px-4 rounded-lg border-2 transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-brand-blue text-white border-brand-blue'
                  : 'bg-white dark:bg-gray-800/60 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-brand-blue`}
              aria-label="Grid view"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <rect x="2" y="2" width="5" height="5" rx="1" />
                <rect x="9" y="2" width="5" height="5" rx="1" />
                <rect x="2" y="9" width="5" height="5" rx="1" />
                <rect x="9" y="9" width="5" height="5" rx="1" />
              </svg>
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-3 px-4 rounded-lg border-2 transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-brand-blue text-white border-brand-blue'
                  : 'bg-white dark:bg-gray-800/60 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
              } focus:outline-none focus:ring-2 focus:ring-brand-blue`}
              aria-label="List view"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 4a1 1 0 000 2h6a1 1 0 100-2H2z" />
                <path d="M2 8a1 1 0 000 2h8a1 1 0 100-2H2z" />
                <path d="M2 12a1 1 0 000 2h4a1 1 0 100-2H2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 md:w-64">
        <label htmlFor="sort-by" className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 block">
          Sort by
        </label>
        <div className="relative">
          <select
            id="sort-by"
            value={sortBy}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onSortByChange(e.target.value)}
            className="cursor-pointer w-full appearance-none bg-white dark:bg-gray-800/60 border-2 border-gray-300 dark:border-gray-600 rounded-lg py-2 pl-4 pr-10 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
          >
            <option value="default">Default Order</option>
            <option value="title-asc">Title (A-Z)</option>
            <option value="title-desc">Title (Z-A)</option>
            <option value="year-desc">Newest First</option>
            <option value="year-asc">Oldest First</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-400" aria-hidden="true">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SortFilterControls;
