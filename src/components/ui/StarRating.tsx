// components/ui/StarRating.tsx
interface StarRatingProps {
    rating: number;
    max?: number;
    size?: 'sm' | 'md' | 'lg';
    editable?: boolean;
    onChange?: (rating: number) => void;
  }
  
  export default function StarRating({
    rating,
    max = 5,
    size = 'md',
    editable = false,
    onChange
  }: StarRatingProps) {
    // Size classes
    const sizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-5 w-5',
      lg: 'h-6 w-6'
    };
    
    const starClass = sizeClasses[size];
    
    // Handle star click
    const handleClick = (value: number) => {
      if (editable && onChange) {
        onChange(value);
      }
    };
    
    return (
      <div className="flex items-center">
        {[...Array(max)].map((_, i) => {
          const starValue = i + 1;
          const filled = starValue <= Math.round(rating);
          
          return (
            <span
              key={i}
              onClick={() => handleClick(starValue)}
              className={`${editable ? 'cursor-pointer' : ''} ${filled ? 'text-yellow-400' : 'text-gray-300'}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className={starClass}
              >
                <path
                  fillRule="evenodd"
                  d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
          );
        })}
      </div>
    );
  }