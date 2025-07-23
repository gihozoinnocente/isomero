import React from 'react';
import { Filter, X, RotateCcw } from 'lucide-react';
import { BookFilters, Genre } from '../types';
import { cn } from '../utils/cn';

interface FilterPanelProps {
  filters: BookFilters;
  onFiltersChange: (filters: Partial<BookFilters>) => void;
  genres: Pick<Genre, 'id' | 'name'>[];
  isLoading?: boolean;
  isOpen?: boolean;
  onToggle?: () => void;
  className?: string;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFiltersChange,
  genres,
  isLoading = false,
  isOpen = true,
  onToggle,
  className,
}) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  const handleFilterChange = (key: keyof BookFilters, value: any) => {
    onFiltersChange({ [key]: value, page: 1 }); // Reset to page 1 when filtering
  };

  const handleClearFilters = () => {
    onFiltersChange({
      page: 1,
      limit: filters.limit,
      q: '',
      genre: '',
      author: '',
      year: undefined,
      minRating: undefined,
      maxRating: undefined,
      sort: 'created_at',
      order: 'desc',
    });
  };

  const hasActiveFilters = !!(
    filters.q ||
    filters.genre ||
    filters.author ||
    filters.year ||
    filters.minRating ||
    filters.maxRating ||
    (filters.sort && filters.sort !== 'created_at') ||
    (filters.order && filters.order !== 'desc')
  );

  const FilterSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-gray-900 dark:text-white">{title}</h3>
      {children}
    </div>
  );

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className={cn(
          'inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors',
          className
        )}
      >
        <Filter className="w-4 h-4 mr-2" />
        Filters
        {hasActiveFilters && (
          <span className="ml-2 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            !
          </span>
        )}
      </button>
    );
  }

  return (
    <div className={cn('bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm', className)}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h2>
            {hasActiveFilters && (
              <span className="ml-2 bg-primary-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                !
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Clear
              </button>
            )}
            {onToggle && (
              <button
                onClick={onToggle}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Genre Filter */}
        <FilterSection title="Genre">
          <select
            value={filters.genre || ''}
            onChange={(e) => handleFilterChange('genre', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            disabled={isLoading}
          >
            <option value="">All Genres</option>
            {genres.map((genre) => (
              <option key={genre.id} value={genre.name}>
                {genre.name}
              </option>
            ))}
          </select>
        </FilterSection>

        {/* Author Filter */}
        <FilterSection title="Author">
          <input
            type="text"
            value={filters.author || ''}
            onChange={(e) => handleFilterChange('author', e.target.value)}
            placeholder="Search by author name..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            disabled={isLoading}
          />
        </FilterSection>

        {/* Publication Year Filter */}
        <FilterSection title="Publication Year">
          <select
            value={filters.year || ''}
            onChange={(e) => handleFilterChange('year', e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            disabled={isLoading}
          >
            <option value="">Any Year</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </FilterSection>

        {/* Rating Filter */}
        <FilterSection title="Minimum Rating">
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Min Rating: {filters.minRating || 0}
              </label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={filters.minRating || 0}
                onChange={(e) => handleFilterChange('minRating', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                disabled={isLoading}
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>0</span>
                <span>2.5</span>
                <span>5</span>
              </div>
            </div>
          </div>
        </FilterSection>

        {/* Sort Options */}
        <FilterSection title="Sort By">
          <div className="space-y-3">
            <select
              value={filters.sort || 'created_at'}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={isLoading}
            >
              <option value="created_at">Date Added</option>
              <option value="title">Title</option>
              <option value="publication_date">Publication Date</option>
              <option value="average_rating">Rating</option>
            </select>

            <div className="flex space-x-2">
              <button
                onClick={() => handleFilterChange('order', 'asc')}
                className={cn(
                  'flex-1 px-3 py-2 text-sm rounded-md border transition-colors',
                  filters.order === 'asc'
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                )}
                disabled={isLoading}
              >
                Ascending
              </button>
              <button
                onClick={() => handleFilterChange('order', 'desc')}
                className={cn(
                  'flex-1 px-3 py-2 text-sm rounded-md border transition-colors',
                  filters.order === 'desc'
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                )}
                disabled={isLoading}
              >
                Descending
              </button>
            </div>
          </div>
        </FilterSection>

        {/* Results per page */}
        <FilterSection title="Results per page">
          <select
            value={filters.limit || 12}
            onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            disabled={isLoading}
          >
            <option value={6}>6 books</option>
            <option value={12}>12 books</option>
            <option value={24}>24 books</option>
            <option value={48}>48 books</option>
          </select>
        </FilterSection>
      </div>
    </div>
  );
};

export default FilterPanel;