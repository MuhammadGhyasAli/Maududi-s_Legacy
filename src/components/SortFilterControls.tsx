import React from 'react';

interface SortFilterControlsProps {
  sortBy: string;
  onSortByChange: (sort: string) => void;
  totalBooks: number;
  viewMode: 'grid' | 'list';
  onViewModeChange: (view: 'grid' | 'list') => void;
  isAuthenticated?: boolean;
}

function SortFilterControls({
  totalBooks,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortByChange,
  isAuthenticated = false,
}: SortFilterControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center justify-between sm:justify-start gap-4">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          <span className="font-semibold text-gray-900 dark:text-gray-100">{totalBooks}</span> books
        </div>

        <div className="flex items-center gap-0.5 border border-gray-200 dark:border-gray-700 rounded-lg p-0.5" role="group" aria-label="View mode">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-gray-100 dark:bg-white/10 text-brand-green'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
            aria-label="Grid view"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <rect x="2" y="2" width="5" height="5" rx="1" />
              <rect x="9" y="2" width="5" height="5" rx="1" />
              <rect x="2" y="9" width="5" height="5" rx="1" />
              <rect x="9" y="9" width="5" height="5" rx="1" />
            </svg>
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              viewMode === 'list'
                ? 'bg-gray-100 dark:bg-white/10 text-brand-green'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
            aria-label="List view"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 4a1 1 0 000 2h6a1 1 0 100-2H2z" />
              <path d="M2 8a1 1 0 000 2h8a1 1 0 100-2H2z" />
              <path d="M2 12a1 1 0 000 2h4a1 1 0 100-2H2z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-shrink-0 w-full sm:w-56">
        <div className="relative">
          <select
            id="sort-by"
            value={sortBy}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onSortByChange(e.target.value)}
            className="select-base text-xs sm:text-sm"
          >
            <option value="default">Default Order</option>
            {isAuthenticated && <option value="reading-preference">Reading Preference</option>}
            <option value="title-asc">Title A–Z</option>
            <option value="title-desc">Title Z–A</option>
            <option value="year-desc">Newest First</option>
            <option value="year-asc">Oldest First</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400" aria-hidden="true">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(SortFilterControls);
