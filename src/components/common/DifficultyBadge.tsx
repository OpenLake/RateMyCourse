import { Badge } from '@/components/ui/badge';

interface DifficultyBadgeProps {
  difficulty: number;
  showText?: boolean;
  large?: boolean;
}

export function DifficultyBadge({ 
  difficulty, 
  showText = false,
  large = false
}: DifficultyBadgeProps) {
  let color = '';
  let text = '';
  
  if (difficulty < 2) {
    color = 'bg-green-500/20 text-green-700 dark:bg-green-900/70 dark:text-green-300';
    text = 'Easy';
  } else if (difficulty < 3) {
    color = 'bg-blue-500/20 text-blue-700 dark:bg-blue-900/70 dark:text-blue-300';
    text = 'Moderate';
  } else if (difficulty < 4) {
    color = 'bg-orange-500/20 text-orange-700 dark:bg-orange-900/70 dark:text-orange-300';
    text = 'Challenging';
  } else {
    color = 'bg-red-500/20 text-red-700 dark:bg-red-900/70 dark:text-red-300';
    text = 'Difficult';
  }
  
  return (
    <Badge 
      variant="outline" 
      className={`${color} ${large ? 'px-4 py-1 text-base' : ''}`}
    >
      {showText ? text : `${difficulty}/5`}
    </Badge>
  );
}