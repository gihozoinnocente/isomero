import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Grid, List, Filter, SlidersHorizontal } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchBooks, setFilters, resetFilters } from '../store/slices/booksSlice';
import { fetchMinimalGenres } from '../store/slices/genresSlice';
import BookCard from '../components/BookCard';
import FilterPanel from '../components/FilterPanel';
import Pagination from '../components/Pagination';
import SearchBar from '../components/SearchBar';
import Skeleton from 'react-loading-skeleton';
import { cn } from '../utils/cn';
import { BookFilters } from '../types';

const Books: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const { books, filters, pagination, isLoading } = useAppSelector(state => state.books);
  const { minimal: genres } = useAppSelector(state => state.genres);
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Initialize filters from URL params
  useEffect(() => {
    const urlFilters: Partial<BookFilters> = {};
    
    // Extract filters from URL
    const q = searchParams.get('q');
    const genre = searchParams.get('genre');
    const author = searchParams.get('author');
    const year = searchParams.get('year');
    const minRating = searchParams.get('minRating');
    const maxRating = searchParams.get('maxRating');
    const sort = searchParams.get('sort');
    const order = searchParams.get('order');
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');

    if (q) urlFilters.q = q;
    if (genre) urlFilters.genre = genre;
    if (author) urlFilters.author = author;
    if (year) urlFilters.year = parseInt(year);
    if (minRating) urlFilters.minRating = parseFloat(minRating);
    if (maxRating) urlFilters.maxRating = parseFloat(maxRating);
    if (sort) urlFilters.sort = sort as any;
    if (order) urlFilters.order = order as any;
    if (page) urlFilters.page = parseInt(page);
    if (limit) urlFilters.limit = parseInt(limit);

    // Set initial search query
    if (q) setSearchQuery(q);

    // Update filters if URL params exist
    if (Object.keys(urlFilters).length > 0) {
      dispatch(setFilters(urlFilters));
    }

    // Fetch genres for filter dropdown
    dispatch(fetchMinimalGenres());
  }, [searchParams, dispatch]);

  // Fetch books when filters change
  useEffect(() => {
    dispatch(fetchBooks(filters));
  }, [dispatch, filters]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, value.toString());
      }
    });

    const newSearch = params.toString();
    if (newSearch !== searchParams.toString()) {
      setSearchParams(params, { replace: true });
    }
  }, [filters, setSearchParams, searchParams]);

  const handleFiltersChange = (newFilters: Partial<BookFilters>) => {
    dispatch(setFilters(newFilters));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    handleFiltersChange({ q: query, page: 1 });
  };

  const handlePageChange = (page: number) => {
    handleFiltersChange({ page });
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookClick = (book: any) => {
    navigate(`/books/${book.id}`);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    dispatch(resetFilters());
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

  const renderBooksList = () => {
    if (isLoading) {
      return (
        <div className={cn(
          'grid gap-6',
          viewMode === 'grid'
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
            : 'grid-cols-1'
        )}>
          {Array.from({ length: filters.limit || 12 }).map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
              <Skeleton height={viewMode === 'grid' ? 256 : 200} />
              <div className="p-4">
                <Skeleton height={24} className="mb-2" />
                <Skeleton height={16} className="mb-2" />
                <Skeleton height={20} />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (books.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-600 mb-4">
            <Filter className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No books found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Try adjusting your search criteria or filters
          </p>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      );
    }

    return (
      <div className={cn(
        'grid gap-6',
        viewMode === 'grid'
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          : 'grid-cols-1'
      )}>
        {books.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            variant={viewMode === 'list' ? 'detailed' : 'default'}
            onClick={handleBookClick}
            className="h-full"
          />
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Discover Books
        </h1>
        
        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSubmit={handleSearch}
            placeholder="Search books by title, author, or ISBN..."
            isLoading={isLoading}
          />
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-2 rounded-md transition-colors',
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                )}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-2 rounded-md transition-colors',
                  viewMode === 'list'
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Toggle (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  !
                </span>
              )}
            </button>
          </div>

          {/* Results count */}
          {pagination && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} results
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className={cn(
          'lg:w-80 flex-shrink-0',
          showFilters ? 'block' : 'hidden lg:block'
        )}>
          <FilterPanel
            filters={filters}
            onFiltersChange={handleFiltersChange}
            genres={genres}
            isLoading={isLoading}
            isOpen={true}
          />
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {renderBooksList()}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="mt-12">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.pages}
                onPageChange={handlePageChange}
                totalItems={pagination.total}
                itemsPerPage={pagination.limit}
                showInfo={true}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Books;