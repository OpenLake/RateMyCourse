import { Star, StarHalf } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

export function StarRating({ 
  rating, 
  maxRating = 5,
  size = 'medium',
  color = '#FFD700',
}: StarRatingProps) {
  const normalizedRating = (rating / maxRating) * 5;
  const roundedHalf = Math.round(normalizedRating * 2) / 2;

  let dimensions;
  switch (size) {
    case 'small':
      dimensions = 'h-3 w-3';
      break;
    case 'large':
      dimensions = 'h-6 w-6';
      break;
    default:
      dimensions = 'h-4 w-4';
  }

  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const isFilled = i <= roundedHalf;
    const isHalf = i - 0.5 === roundedHalf;

    const style = isFilled || isHalf ? { color, fill: color } : undefined;

    if (isFilled) {
      stars.push(
        <Star key={i} className={dimensions} style={style} />
      );
    } else if (isHalf) {
      stars.push(
        <StarHalf key={i} className={dimensions} style={style} />
      );
    } else {
      stars.push(
        <Star key={i} className={`${dimensions} text-muted`} />
      );
    }
  }

  return <div className="flex">{stars}</div>;
}
