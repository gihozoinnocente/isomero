import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { cn } from '../utils/cn';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (query: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  className?: string;
  variant?: 'default' | 'compact';
  autoFocus?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = 'Search books, authors, genres...',
  isLoading = false,
  className,
  variant = 'default',
  autoFocus = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value.trim());
    }
  };

  const handleClear = () => {
    onChange('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  const isCompact = variant === 'compact';

  return (
    <form onSubmit={handleSubmit} className={cn('relative', className)}>
      <div
        className={cn(
          'relative flex items-center transition-all duration-200',
          isFocused
            ? 'ring-2 ring-primary-500 ring-opacity-50'
            : 'ring-1 ring-gray-300 dark:ring-gray-600',
          isCompact
            ? 'rounded-lg bg-gray-50 dark:bg-gray-700'
            : 'rounded-xl bg-white dark:bg-gray-800 shadow-sm',
          'border border-gray-200 dark:border-gray-700'
        )}
      >
        <div className={cn('flex items-center pl-3', isCompact ? 'py-2' : 'py-3')}>
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          ) : (
            <Search className="w-5 h-5 text-gray-400" />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            'flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400',
            isCompact ? 'px-2 py-2 text-sm' : 'px-3 py-3'
          )}
        />

        {value && (
          <button
            type="button"
            onClick={handleClear}
            className={cn(
              'flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors',
              isCompact ? 'w-8 h-8 mr-1' : 'w-10 h-10 mr-2'
            )}
          >
            <X className="w-4 h-4" />
          </button>
        )}

        <button
          type="submit"
          disabled={!value.trim() || isLoading}
          className={cn(
            'flex items-center justify-center bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-lg transition-colors',
            isCompact ? 'w-8 h-8 mr-1' : 'w-10 h-10 mr-2',
            !value.trim() && 'cursor-not-allowed'
          )}
        >
          <Search className="w-4 h-4" />
        </button>
      </div>

      {/* Search suggestions could be added here */}
      {isFocused && value && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {/* Placeholder for search suggestions */}
          <div className="p-3 text-sm text-gray-500 dark:text-gray-400">
            Press Enter to search for "{value}"
          </div>
        </div>
      )}
    </form>
  );
};

export default SearchBar;