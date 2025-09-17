import React from 'react';

interface SortFilterControlsProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  sortBy: string;
  onSortByChange: (sort: string) => void;
}

const SortFilterControls: React.FC<SortFilterControlsProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  sortBy,
  onSortByChange,
}) => {
  return (
    <div className="my-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
      <div className="flex-grow">
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3" id="filter-label">
          Filter by Category
        </h3>
        <div className="flex flex-wrap gap-2" role="group" aria-labelledby="filter-label">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onSelectCategory(category)}
              className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors duration-200 ${
                selectedCategory === category
                  ? 'bg-brand-blue text-white shadow'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
              aria-pressed={selectedCategory === category}
            >
              {category}
            </button>
          ))}
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
            onChange={(e) => onSortByChange(e.target.value)}
            className="w-full appearance-none bg-white dark:bg-gray-800/60 border-2 border-gray-300 dark:border-gray-600 rounded-lg py-2 pl-4 pr-10 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-blue"
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