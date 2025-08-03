import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, BookOpen } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchFavorites } from '../store/slices/booksSlice';
import BookCard from '../components/BookCard';
import Skeleton from 'react-loading-skeleton';

const Favorites: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const { favorites, isLoading } = useAppSelector(state => state.books);

  useEffect(() => {
    dispatch(fetchFavorites({}));
  }, [dispatch]);

  const handleBookClick = (book: any) => {
    navigate(`/books/${book.id}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Skeleton height={40} width={300} className="mb-4" />
          <Skeleton height={20} width={400} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
              <Skeleton height={256} />
              <div className="p-4">
                <Skeleton height={24} className="mb-2" />
                <Skeleton height={16} className="mb-2" />
                <Skeleton height={20} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Heart className="w-8 h-8 text-red-500 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Favorites
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Books you've saved to your personal collection
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No favorite books yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start building your collection by adding books to your favorites
          </p>
          <button
            onClick={() => navigate('/books')}
            className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
          >
            <BookOpen className="w-5 h-5 mr-2" />
            Discover Books
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onClick={handleBookClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;