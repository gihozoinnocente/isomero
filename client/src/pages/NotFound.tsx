import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowLeft, Home } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          {/* Logo */}
          <Link to="/" className="inline-flex items-center space-x-2 mb-8">
            <BookOpen className="w-12 h-12 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              Book Hub
            </span>
          </Link>

          {/* 404 Error */}
          <h1 className="text-9xl font-bold text-primary-600 mb-4">404</h1>
          
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Page not found
          </h2>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            Sorry, we couldn't find the page you're looking for. The book you're searching for might have been moved or doesn't exist.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Go Back
            </button>
            
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
            >
              <Home className="w-5 h-5 mr-2" />
              Go Home
            </Link>
          </div>

          {/* Additional Links */}
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Looking for something specific?
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link
                to="/books"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
              >
                Browse Books
              </Link>
              <Link
                to="/authors"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
              >
                Explore Authors
              </Link>
              <Link
                to="/genres"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
              >
                Browse Genres
              </Link>
              <Link
                to="/trending"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
              >
                Trending Books
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;