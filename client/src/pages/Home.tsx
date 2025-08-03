import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, TrendingUp, Star, ArrowRight } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchTrendingBooks, fetchTopRatedBooks, fetchRecommendations } from '../store/slices/booksSlice';
import { fetchPopularGenres } from '../store/slices/genresSlice';
import BookCard from '../components/BookCard';
import SearchBar from '../components/SearchBar';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const Home: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const { trending, topRated, recommendations, isLoading } = useAppSelector(state => state.books);
  const { popular: popularGenres } = useAppSelector(state => state.genres);
  const { isAuthenticated } = useAppSelector(state => state.auth);

  useEffect(() => {
    // Fetch trending books
    dispatch(fetchTrendingBooks({ limit: 8 }));
    
    // Fetch top rated books
    dispatch(fetchTopRatedBooks({ limit: 8 }));
    
    // Fetch popular genres
    dispatch(fetchPopularGenres(8));
    
    // Fetch recommendations if authenticated
    if (isAuthenticated) {
      dispatch(fetchRecommendations(8));
    }
  }, [dispatch, isAuthenticated]);

  const handleSearch = (query: string) => {
    navigate(`/books?q=${encodeURIComponent(query)}`);
  };

  const handleBookClick = (book: any) => {
    navigate(`/books/${book.id}`);
  };

  const handleGenreClick = (genre: any) => {
    navigate(`/books?genre=${encodeURIComponent(genre.name)}`);
  };

  const BookSection: React.FC<{
    title: string;
    subtitle?: string;
    books: any[];
    viewAllLink: string;
    icon: React.ReactNode;
    isLoading?: boolean;
  }> = ({ title, subtitle, books, viewAllLink, icon, isLoading = false }) => (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            {icon}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
          </div>
          {subtitle && (
            <p className="text-gray-600 dark:text-gray-400">{subtitle}</p>
          )}
        </div>
        <Link
          to={viewAllLink}
          className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
        >
          View all
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, index) => (
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
          books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onClick={handleBookClick}
              className="h-full"
            />
          ))
        )}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Discover Your Next
              <span className="block text-yellow-300">Great Read</span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto">
              Explore thousands of books, discover new authors, and join a community of passionate readers
            </p>
            
            {/* Hero Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <SearchBar
                value=""
                onChange={() => {}}
                onSubmit={handleSearch}
                placeholder="Search for books, authors, or genres..."
                className="shadow-xl"
              />
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-yellow-300 mb-2">10K+</div>
                <div className="text-primary-100">Books Available</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-yellow-300 mb-2">500+</div>
                <div className="text-primary-100">Authors Featured</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-yellow-300 mb-2">50+</div>
                <div className="text-primary-100">Genres Covered</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Personalized Recommendations */}
        {isAuthenticated && recommendations.length > 0 && (
          <BookSection
            title="Recommended for You"
            subtitle="Books we think you'll love based on your reading history"
            books={recommendations}
            viewAllLink="/recommendations"
            icon={<Star className="w-6 h-6 text-yellow-500" />}
            isLoading={isLoading}
          />
        )}

        {/* Trending Books */}
        <BookSection
          title="Trending Now"
          subtitle="Books that are popular with readers this month"
          books={trending}
          viewAllLink="/trending"
          icon={<TrendingUp className="w-6 h-6 text-green-500" />}
          isLoading={isLoading}
        />

        {/* Top Rated Books */}
        <BookSection
          title="Highest Rated"
          subtitle="Books with the best ratings from our community"
          books={topRated}
          viewAllLink="/top-rated"
          icon={<Star className="w-6 h-6 text-yellow-500" />}
          isLoading={isLoading}
        />

        {/* Popular Genres */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <BookOpen className="w-6 h-6 text-purple-500" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Popular Genres</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400">Explore books by your favorite genres</p>
            </div>
            <Link
              to="/genres"
              className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
            >
              View all
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-4">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <Skeleton height={20} />
                  <Skeleton height={16} className="mt-2" />
                </div>
              ))
            ) : (
              popularGenres.slice(0, 8).map((genre) => (
                <button
                  key={genre.id}
                  onClick={() => handleGenreClick(genre)}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center hover:shadow-md hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200 group"
                >
                  <div className="text-lg font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {genre.name}
                  </div>
                  {genre.books_count && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {genre.books_count} books
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
        </section>

        {/* Call to Action */}
        {!isAuthenticated && (
          <section className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-2xl p-8 lg:p-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Join the Book Hub Community
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Create an account to save your favorite books, get personalized recommendations, 
              and connect with fellow book lovers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
              >
                Get Started Free
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center px-6 py-3 border border-primary-600 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 font-medium rounded-lg transition-colors"
              >
                Sign In
              </Link>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Home;