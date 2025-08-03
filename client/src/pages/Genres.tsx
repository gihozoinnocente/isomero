import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tag, BookOpen } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchGenres } from '../store/slices/genresSlice';
import Skeleton from 'react-loading-skeleton';

const Genres: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const { genres, isLoading } = useAppSelector(state => state.genres);

  useEffect(() => {
    dispatch(fetchGenres({ limit: 50 }));
  }, [dispatch]);

  const handleGenreClick = (genre: any) => {
    navigate(`/books?genre=${encodeURIComponent(genre.name)}`);
  };

  const renderGenreCard = (genre: any) => (
    <div
      key={genre.id}
      onClick={() => handleGenreClick(genre)}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-book hover:shadow-book-hover border border-gray-200 dark:border-gray-700 p-6 cursor-pointer group transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mr-4">
            <Tag className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {genre.name}
            </h3>
            {genre.books_count !== undefined && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {genre.books_count} {genre.books_count === 1 ? 'book' : 'books'}
              </p>
            )}
          </div>
        </div>
        <BookOpen className="w-5 h-5 text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors" />
      </div>
      
      {genre.description && (
        <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
          {genre.description}
        </p>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Tag className="w-8 h-8 text-primary-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Genres
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Explore books by genre and discover new categories
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center mb-4">
                <Skeleton circle width={48} height={48} className="mr-4" />
                <div className="flex-1">
                  <Skeleton height={20} width="80%" className="mb-1" />
                  <Skeleton height={16} width="60%" />
                </div>
              </div>
              <Skeleton height={40} />
            </div>
          ))
        ) : (
          genres.map(renderGenreCard)
        )}
      </div>
    </div>
  );
};

export default Genres;