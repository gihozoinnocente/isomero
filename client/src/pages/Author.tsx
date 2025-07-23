import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, Search, Users } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchAuthors, searchAuthors } from '../store/slices/authorsSlice';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import Skeleton from 'react-loading-skeleton';
import { cn } from '../utils/cn';

const Authors: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const { authors, pagination, isLoading } = useAppSelector(state => state.authors);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Initialize from URL params
  useEffect(() => {
    const q = searchParams.get('q');
    const sort = searchParams.get('sort');
    const order = searchParams.get('order');
    const page = searchParams.get('page');

    if (q) setSearchQuery(q);
    if (sort) setSortBy(sort);
    if (order) setSortOrder(order);

    const filters = {
      page: page ? parseInt(page) : 1,
      limit: 12,
      q: q || undefined,
      sort: sort || 'name',
      order: order || 'asc'
    };

    if (q) {
      dispatch(searchAuthors({ query: q, limit: 12 }));
    } else {
      dispatch(fetchAuthors(filters));
    }
  }, [searchParams, dispatch]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const params = new URLSearchParams(searchParams);
    
    if (query) {
      params.set('q', query);
      params.delete('page'); // Reset to page 1
    } else {
      params.delete('q');
    }
    
    setSearchParams(params);
  };

  const handleSortChange = (newSortBy: string, newSortOrder: string) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    
    const params = new URLSearchParams(searchParams);
    params.set('sort', newSortBy);
    params.set('order', newSortOrder);
    params.delete('page'); // Reset to page 1
    
    setSearchParams(params);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    setSearchParams(params);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthorClick = (author: any) => {
    navigate(`/authors/${author.id}`);
  };

  const formatNationality = (nationality: string) => {
    return nationality ? nationality : 'Unknown';
  };

  const formatBirthYear = (birthDate: string) => {
    return birthDate ? new Date(birthDate).getFullYear() : null;
  };

  const renderAuthorCard = (author: any) => (
    <div
      key={author.id}
      onClick={() => handleAuthorClick(author)}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-book hover:shadow-book-hover border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 cursor-pointer group"
    >
      <div className="p-6">
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            {author.image_url ? (
              <img
                src={author.image_url}
                alt={author.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {author.name}
            </h3>
            
            <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {formatNationality(author.nationality)}
              {author.birth_date && (
                <span> • Born {formatBirthYear(author.birth_date)}</span>
              )}
            </div>
            
            {author.books_count !== undefined && (
              <div className="mt-2 text-sm text-primary-600 dark:text-primary-400 font-medium">
                {author.books_count} {author.books_count === 1 ? 'book' : 'books'}
              </div>
            )}
            
            {author.bio && (
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                {author.bio}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSkeletonCard = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-start space-x-4">
        <Skeleton circle width={64} height={64} />
        <div className="flex-1">
          <Skeleton height={24} width="60%" className="mb-2" />
          <Skeleton height={16} width="40%" className="mb-2" />
          <Skeleton height={16} width="30%" className="mb-3" />
          <Skeleton height={40} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Users className="w-8 h-8 text-primary-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Authors
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Discover talented authors and explore their literary works
        </p>
        
        {/* Search Bar */}
        <div className="max-w-2xl">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSubmit={handleSearch}
            placeholder="Search authors by name..."
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center space-x-4">
          {/* Sort Options */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [newSortBy, newSortOrder] = e.target.value.split('-');
              handleSortChange(newSortBy, newSortOrder);
            }}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            disabled={isLoading}
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="created_at-desc">Recently Added</option>
            <option value="created_at-asc">Oldest First</option>
          </select>
        </div>

        {/* Results count */}
        {pagination && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} authors
          </div>
        )}
      </div>

      {/* Authors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {isLoading ? (
          Array.from({ length: 12 }).map((_, index) => (
            <div key={index}>
              {renderSkeletonCard()}
            </div>
          ))
        ) : authors.length > 0 ? (
          authors.map(renderAuthorCard)
        ) : (
          <div className="col-span-full text-center py-12">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No authors found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchQuery 
                ? `No authors match "${searchQuery}"`
                : "No authors available at the moment"
              }
            </p>
            {searchQuery && (
              <button
                onClick={() => handleSearch('')}
                className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.pages}
          onPageChange={handlePageChange}
          totalItems={pagination.total}
          itemsPerPage={pagination.limit}
          showInfo={true}
        />
      )}
    </div>
  );
};

export default Authors;