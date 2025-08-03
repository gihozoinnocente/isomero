import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '../utils/cn';

interface RatingStarsProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  showValue?: boolean;
  className?: string;
}

const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  size = 'md',
  interactive = false,
  onChange,
  showValue = false,
  className,
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const displayRating = hoverRating !== null ? hoverRating : rating;

  const handleStarClick = (starRating: number) => {
    if (interactive && onChange) {
      onChange(starRating);
    }
  };

  const handleStarHover = (starRating: number) => {
    if (interactive) {
      setHoverRating(starRating);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(null);
    }
  };

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(displayRating);
    const hasHalfStar = displayRating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      const isFilled = i <= fullStars;
      const isHalfFilled = i === fullStars + 1 && hasHalfStar && !interactive;
      const isHovered = hoverRating !== null && i <= hoverRating;

      stars.push(
        <button
          key={i}
          type="button"
          disabled={!interactive}
          className={cn(
            'relative transition-all duration-150',
            interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default',
            sizeClasses[size]
          )}
          onClick={() => handleStarClick(i)}
          onMouseEnter={() => handleStarHover(i)}
          onMouseLeave={handleMouseLeave}
        >
          <Star
            className={cn(
              'absolute inset-0 transition-colors duration-150',
              (isFilled || isHovered) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600',
              sizeClasses[size]
            )}
            fill={(isFilled || isHovered) ? 'currentColor' : 'none'}
          />
          
          {isHalfFilled && !interactive && (
            <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
              <Star
                className={cn('text-yellow-400', sizeClasses[size])}
                fill="currentColor"
              />
            </div>
          )}
        </button>
      );
    }

    return stars;
  };

  return (
    <div className={cn('flex items-center space-x-1', className)}>
      <div className="flex items-center space-x-0.5" onMouseLeave={handleMouseLeave}>
        {renderStars()}
      </div>
      
      {showValue && (
        <span className={cn('text-gray-600 dark:text-gray-400 font-medium ml-2', textSizeClasses[size])}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default RatingStars;