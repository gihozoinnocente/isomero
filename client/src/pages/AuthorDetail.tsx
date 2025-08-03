import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Calendar, Globe, ArrowLeft, BookOpen } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchAuthor } from '../store/slices/authorsSlice';
import BookCard from '../components/BookCard';
import Skeleton from 'react-loading-skeleton';

const AuthorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const { currentAuthor: author, isLoading } = useAppSelector(state => state.authors);

  useEffect(() => {
    if (id) {
      dispatch(fetchAuthor(id));
    }
  }, [dispatch, id]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton height={40} width={200} className="mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Skeleton height={300} />
          </div>
          <div className="lg:col-span-2">
            <Skeleton height={40} className="mb-4" />
            <Skeleton height={20} className="mb-2" />
            <Skeleton height={100} />
          </div>
        </div>
      </div>
    );
  }

  if (!author) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Author not found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The author you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate('/authors')}
            className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Authors
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            {author.image_url ? (
              <img
                src={author.image_url}
                alt={author.name}
                className="w-48 h-48 mx-auto rounded-full object-cover mb-6"
              />
            ) : (
              <div className="w-48 h-48 mx-auto bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mb-6">
                <User className="w-24 h-24 text-primary-600 dark:text-primary-400" />
              </div>
            )}
            
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-4">
              {author.name}
            </h1>
            
            <div className="space-y-3 text-sm">
              {author.nationality && (
                <div className="flex items-center">
                  <Globe className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-600 dark:text-gray-300">{author.nationality}</span>
                </div>
              )}
              
              {author.birth_date && (
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-600 dark:text-gray-300">
                    Born {new Date(author.birth_date).getFullYear()}
                    {author.death_date && ` - ${new Date(author.death_date).getFullYear()}`}
                  </span>
                </div>
              )}
              
              {author.books_count !== undefined && (
                <div className="flex items-center">
                  <BookOpen className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-600 dark:text-gray-300">
                    {author.books_count} {author.books_count === 1 ? 'book' : 'books'}
                  </span>
                </div>
              )}
            </div>
            
            {author.website_url && (
              <a
                href={author.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full mt-6 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg text-center transition-colors"
              >
                Visit Website
              </a>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          {author.bio && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Biography
              </h2>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {author.bio}
                </p>
              </div>
            </div>
          )}
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
              Books by {author.name}
            </h2>
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Book listing coming soon...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorDetail;