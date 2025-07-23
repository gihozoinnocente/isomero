import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, Star, Calendar, User, BookOpen, ArrowLeft, Share2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchBook, addToFavorites, removeFromFavorites, addBookRating } from '../store/slices/booksSlice';
import RatingStars from '../components/RatingStars';
import BookCard from '../components/BookCard';
import Skeleton from 'react-loading-skeleton';
import { cn } from '../utils/cn';

const BookDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const { currentBook: book, isLoading } = useAppSelector(state => state.books);
  const { isAuthenticated } = useAppSelector(state => state.auth);
  
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState('');

  useEffect(() => {
    if (id) {
      dispatch(fetchBook(id));
    }
  }, [dispatch, id]);

  const handleFavoriteToggle = () => {
    if (!book || !isAuthenticated) return;
    
    if (book.is_favorite) {
      dispatch(removeFromFavorites(book.id));
    } else {
      dispatch(addToFavorites(book.id));
    }
  };

  const handleRatingSubmit = async () => {
    if (!book || !userRating) return;
    
    try {
      await dispatch(addBookRating({
        bookId: book.id,
        ratingData: { rating: userRating, review: userReview }
      })).unwrap();
      
      setShowRatingModal(false);
      setUserRating(0);
      setUserReview('');
      
      // Refetch book to get updated rating
      dispatch(fetchBook(book.id));
    } catch (error) {
      console.error('Failed to submit rating:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <Skeleton height={40} width={200} className="mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <Skeleton height={400} />
            </div>
            <div className="lg:col-span-2">
              <Skeleton height={40} className="mb-4" />
              <Skeleton height={20} className="mb-2" />
              <Skeleton height={20} className="mb-4" />
              <Skeleton height={100} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Book not found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The book you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate('/books')}
            className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Books
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>

        {/* Book Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Book Cover */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <img
                src={book.cover_image_url || '/placeholder-book.jpg'}
                alt={book.title}
                className="w-full max-w-sm mx-auto rounded-lg shadow-xl"
              />
              
              {/* Action Buttons */}
              {isAuthenticated && (
                <div className="flex flex-col gap-3 mt-6">
                  <button
                    onClick={handleFavoriteToggle}
                    className={cn(
                      'flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors',
                      book.is_favorite
                        ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/30'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    )}
                  >
                    <Heart 
                      className="w-4 h-4 mr-2" 
                      fill={book.is_favorite ? 'currentColor' : 'none'} 
                    />
                    {book.is_favorite ? 'Remove from Favorites' : 'Add to Favorites'}
                  </button>
                  
                  <button
                    onClick={() => setShowRatingModal(true)}
                    className="flex items-center justify-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <Star className="w-4 h-4 mr-2" />
                    {book.user_rating ? 'Update Rating' : 'Rate this Book'}
                  </button>
                  
                  <button className="flex items-center justify-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 font-medium rounded-lg transition-colors">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Book Information */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Title and Subtitle */}
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {book.title}
                </h1>
                {book.subtitle && (
                  <h2 className="text-xl text-gray-600 dark:text-gray-300">
                    {book.subtitle}
                  </h2>
                )}
              </div>

              {/* Authors */}
              {book.authors && book.authors.length > 0 && (
                <div className="flex items-center text-lg">
                  <User className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-gray-600 dark:text-gray-300">by </span>
                  {book.authors.map((author, index) => (
                    <span key={author.id}>
                      <button className="text-primary-600 dark:text-primary-400 hover:underline font-medium">
                        {author.name}
                      </button>
                      {index < book.authors.length - 1 && ', '}
                    </span>
                  ))}
                </div>
              )}

              {/* Rating */}
              <div className="flex items-center space-x-4">
                <RatingStars rating={book.average_rating} size="lg" showValue />
                <span className="text-gray-500">({book.ratings_count} reviews)</span>
                {book.user_rating && (
                  <div className="flex items-center space-x-2 text-sm bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-200 px-3 py-1 rounded-full">
                    <Star className="w-4 h-4" fill="currentColor" />
                    <span>You rated: {book.user_rating.rating}/5</span>
                  </div>
                )}
              </div>

              {/* Genres */}
              {book.genres && book.genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {book.genres.map((genre: { id: React.Key; name: string }) => (
                    <button
                      key={genre.id}
                      onClick={() => navigate(`/books?genre=${encodeURIComponent(String(genre.name))}`)}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      {genre.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Book Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                {book.publication_date && (
                  <div className="text-center">
                    <Calendar className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                    <div className="text-sm text-gray-500 dark:text-gray-400">Published</div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {formatDate(book.publication_date)}
                    </div>
                  </div>
                )}
                
                {book.page_count && (
                  <div className="text-center">
                    <BookOpen className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                    <div className="text-sm text-gray-500 dark:text-gray-400">Pages</div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {book.page_count}
                    </div>
                  </div>
                )}
                
                <div className="text-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Format</div>
                  <div className="font-medium text-gray-900 dark:text-white capitalize">
                    {book.format}
                  </div>
                </div>
                
                {book.price && (
                  <div className="text-center">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Price</div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {formatPrice(book.price, book.currency)}
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              {book.description && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    About this book
                  </h3>
                  <div className="prose prose-gray dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {book.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Additional Details */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Book Details
                </h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {book.isbn_13 && (
                    <div>
                      <dt className="text-sm text-gray-500 dark:text-gray-400">ISBN-13</dt>
                      <dd className="font-medium text-gray-900 dark:text-white">{book.isbn_13}</dd>
                    </div>
                  )}
                  {book.isbn_10 && (
                    <div>
                      <dt className="text-sm text-gray-500 dark:text-gray-400">ISBN-10</dt>
                      <dd className="font-medium text-gray-900 dark:text-white">{book.isbn_10}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm text-gray-500 dark:text-gray-400">Language</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">{book.language.toUpperCase()}</dd>
                  </div>
                  {book.publisher_name && (
                    <div>
                      <dt className="text-sm text-gray-500 dark:text-gray-400">Publisher</dt>
                      <dd className="font-medium text-gray-900 dark:text-white">{book.publisher_name}</dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Rate "{book.title}"
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Your Rating
                </label>
                <RatingStars
                  rating={userRating}
                  size="lg"
                  interactive
                  onChange={setUserRating}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Review (Optional)
                </label>
                <textarea
                  value={userReview}
                  onChange={(e) => setUserReview(e.target.value)}
                  placeholder="Share your thoughts about this book..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                  rows={4}
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowRatingModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRatingSubmit}
                disabled={!userRating}
                className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                Submit Rating
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookDetail;