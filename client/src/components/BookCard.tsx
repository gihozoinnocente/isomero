import React from 'react';
import { Heart, Star, Eye, Calendar, User } from 'lucide-react';
import { Book } from '../types';
import { useAppDispatch, useAppSelector } from '../store';
import { addToFavorites, removeFromFavorites } from '../store/slices/booksSlice';
import RatingStars from './RatingStars';
import { cn } from '../utils/cn';

interface BookCardProps {
  book: Book;
  variant?: 'default' | 'compact' | 'detailed';
  showActions?: boolean;
  onClick?: (book: Book) => void;
  className?: string;
}

const BookCard: React.FC<BookCardProps> = ({
  book,
  variant = 'default',
  showActions = true,
  onClick,
  className,
}) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector(state => state.auth);

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) return;

    if (book.is_favorite) {
      dispatch(removeFromFavorites(book.id));
    } else {
      dispatch(addToFavorites(book.id));
    }
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick(book);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).getFullYear();
  };

  if (variant === 'compact') {
    return (
      <div
        className={cn(
          'flex items-center space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer',
          className
        )}
        onClick={handleCardClick}
      >
        <img
          src={book.cover_image_url || '/placeholder-book.jpg'}
          alt={book.title}
          className="w-12 h-16 object-cover rounded"
        />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {book.title}
          </h3>
          {book.authors && book.authors.length > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {book.authors.map(author => author.name).join(', ')}
            </p>
          )}
          <div className="flex items-center space-x-2 mt-1">
            <RatingStars rating={book.average_rating} size="sm" />
            <span className="text-xs text-gray-500">({book.ratings_count})</span>
          </div>
        </div>
        {showActions && isAuthenticated && (
          <button
            onClick={handleFavoriteToggle}
            className={cn(
              'p-1 rounded-full transition-colors',
              book.is_favorite
                ? 'text-red-500 hover:text-red-600'
                : 'text-gray-400 hover:text-red-500'
            )}
          >
            <Heart size={16} fill={book.is_favorite ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div
        className={cn(
          'bg-white dark:bg-gray-800 rounded-xl shadow-book hover:shadow-book-hover border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 cursor-pointer',
          className
        )}
        onClick={handleCardClick}
      >
        <div className="flex">
          <div className="flex-shrink-0">
            <img
              src={book.cover_image_url || '/placeholder-book.jpg'}
              alt={book.title}
              className="w-32 h-48 object-cover"
            />
          </div>
          <div className="flex-1 p-6">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                {book.title}
              </h3>
              {showActions && isAuthenticated && (
                <button
                  onClick={handleFavoriteToggle}
                  className={cn(
                    'p-2 rounded-full transition-colors',
                    book.is_favorite
                      ? 'text-red-500 hover:text-red-600'
                      : 'text-gray-400 hover:text-red-500'
                  )}
                >
                  <Heart size={20} fill={book.is_favorite ? 'currentColor' : 'none'} />
                </button>
              )}
            </div>

            {book.subtitle && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-1">
                {book.subtitle}
              </p>
            )}

            {book.authors && book.authors.length > 0 && (
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-2">
                <User size={14} className="mr-1" />
                {book.authors.map(author => author.name).join(', ')}
              </div>
            )}

            {book.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                {book.description}
              </p>
            )}

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-4">
                <RatingStars rating={book.average_rating} size="sm" />
                <span className="text-sm text-gray-500">({book.ratings_count} reviews)</span>
              </div>
              {book.publication_date && (
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar size={14} className="mr-1" />
                  {formatDate(book.publication_date)}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              {book.genres && book.genres.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {book.genres.slice(0, 3).map(genre => (
                    <span
                      key={genre.id}
                      className="px-2 py-1 text-xs bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 rounded-full"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}
              {book.price && (
                <span className="text-lg font-semibold text-primary-600 dark:text-primary-400">
                  {formatPrice(book.price, book.currency)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div
      className={cn(
        'group bg-white dark:bg-gray-800 rounded-xl shadow-book hover:shadow-book-hover border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 cursor-pointer',
        className
      )}
      onClick={handleCardClick}
    >
      <div className="relative">
        <img
          src={book.cover_image_url || '/placeholder-book.jpg'}
          alt={book.title}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {showActions && isAuthenticated && (
          <button
            onClick={handleFavoriteToggle}
            className={cn(
              'absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm transition-all duration-200',
              book.is_favorite
                ? 'text-red-500 hover:text-red-600'
                : 'text-gray-400 hover:text-red-500'
            )}
          >
            <Heart size={18} fill={book.is_favorite ? 'currentColor' : 'none'} />
          </button>
        )}
        {book.average_rating > 4.5 && (
          <div className="absolute top-3 left-3 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
            <Star size={12} className="mr-1" fill="currentColor" />
            Best Rated
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {book.title}
        </h3>

        {book.authors && book.authors.length > 0 && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-1">
            by {book.authors.map(author => author.name).join(', ')}
          </p>
        )}

        <div className="flex items-center justify-between mb-3">
          <RatingStars rating={book.average_rating} size="sm" />
          <span className="text-sm text-gray-500">({book.ratings_count})</span>
        </div>

        {book.genres && book.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {book.genres.slice(0, 2).map(genre => (
              <span
                key={genre.id}
                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
              >
                {genre.name}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {book.publication_date && (
              <span className="text-sm text-gray-500">
                {formatDate(book.publication_date)}
              </span>
            )}
            {book.format && (
              <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                {book.format}
              </span>
            )}
          </div>
          {book.price && (
            <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
              {formatPrice(book.price, book.currency)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard;