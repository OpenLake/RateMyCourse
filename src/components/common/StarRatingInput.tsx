import { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingInputProps {
  id?: string;
  value: number;
  onChange: (value: number) => void;
  maxRating?: number;
}

export function StarRatingInput({ 
  id, 
  value, 
  onChange, 
  maxRating = 5 
}: StarRatingInputProps) {
  const [hoverValue, setHoverValue] = useState(0);
  
  return (
    <div className="flex" id={id}>
      {[...Array(maxRating)].map((_, index) => {
        const starValue = index + 1;
        return (
          <Star
            key={index}
            className={`h-6 w-6 cursor-pointer transition-colors ${
              starValue <= (hoverValue || value)
                ? 'fill-primary text-primary'
                : 'text-muted-foreground hover:text-primary'
            }`}
            onClick={() => onChange(starValue)}
            onMouseEnter={() => setHoverValue(starValue)}
            onMouseLeave={() => setHoverValue(0)}
          />
        );
      })}
    </div>
  );
}