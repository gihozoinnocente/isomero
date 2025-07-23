import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchTopRatedBooks } from '../store/slices/booksSlice';
import BookCard from '../components/BookCard';
import Skeleton from 'react-loading-skeleton';

const TopRated: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const { topRated, isLoading } = useAppSelector(state => state.books);

  useEffect(() => {
    dispatch(fetchTopRatedBooks({ limit: 24 }));
  }, [dispatch]);

  const handleBookClick = (book: any) => {
    navigate(`/books/${book.id}`);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Star className="w-8 h-8 text-yellow-500 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Top Rated Books
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Books with the highest ratings from our community
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden">
              <Skeleton height={256} />
              <div className="p-4">
                <Skeleton height={24} className="mb-2" />
                <Skeleton height={16} className="mb-2" />
                <Skeleton height={20} />
              </div>
            </div>
          ))
        ) : (
          topRated.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onClick={handleBookClick}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default TopRated;