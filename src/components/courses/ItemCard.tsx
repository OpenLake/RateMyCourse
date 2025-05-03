import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { StarRating } from '@/components/common/StarRating';
import { DifficultyBadge } from '@/components/common/DifficultyBadge';
import { BookOpen, Users, Clock, ChevronRight, BookMarked } from 'lucide-react';
import { Course, Professor } from '@/types';
import departmentProperties from '@/constants/department';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface ItemCardProps {
  item: Course | Professor;
  className?: string;
  type: 'course' | 'professor';
}

export default function ItemCard({ item, className, type }: ItemCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  let reviewCount: number;
  let overallRating: number;
  let rating1: number;
  let rating2: number;
  let count: number | string[];
  let title: string;
  let subtitle: string;
  let subtext: string | number;
  let link: string;
  let avatar: string;
  if (type === "course") {
    const course = item as Course;
    reviewCount = course.reviewCount;
    overallRating = course.rating.overall;
    rating1 = course.rating.difficulty;
    rating2 = course.rating.workload;
    count = course.professors.length;
    title = course.title;
    subtitle = course.code;
    subtext = course.credits;
    link = `/courses/${course.id}`; 
    avatar = "";
  } else {
    const professor = item as Professor;
    reviewCount = professor.reviewCount;
    overallRating = professor.rating.overall;
    rating1 = professor.rating.knowledge;
    rating2 = professor.rating.teaching;
    count = professor.courses;
    title = professor.name;
    subtitle = professor.post;
    subtext = professor.email;
    link = `/professors/${professor.id}`;
    avatar = professor.avatar_url;
  }
  

  
  const deptProps = useMemo(() => {
    return departmentProperties.find(dept => dept.name === item.department) || {
      id: item.department || 'GEN',
      name: item.department || 'General',
      color: '#718096',
      icon: BookMarked
    };
  }, [item.department]);


  const DeptIcon = deptProps.icon || BookMarked;
  const ratings = [
    { label: "Overall", value: overallRating },
    { label: `${type === 'course' ? "Difficulty" : "Knowledge"}`, value: rating1 },
    { label: `${type === 'course' ? "Workload" : "Teaching"}`, value: rating2 },
  ];
  
  return (
    <Link href={link} className="block w-full group">
      <Card 
        className={`h-full overflow-hidden transition-all duration-300 border border-gray-200 ${
          isHovered ? 'shadow-md translate-y-px' : 'shadow-sm'
        } ${className || ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div 
          className={`transition-all duration-300 h-1.5 group-hover:h-2`} 
          style={{ backgroundColor: deptProps.color }} 
        />
        
        <CardContent className="p-4 pt-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${deptProps.color}20` }}>
              {type == 'course' ? 
                <DeptIcon className="h-5 w-5" style={{ color: deptProps.color }} />
                :
                <Avatar className="h-12 w-12">
                  <AvatarImage src={avatar} />
                  <AvatarFallback>
                  {title.replace('Dr.', "").split(" ").map((text, idx) => (
                    <span key={idx}>{text[0]}</span>
                  ))}
                  </AvatarFallback>
                </Avatar>
              }

            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-lg line-clamp-1 text-gray-900">{title}</h3>
              </div>
              
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-medium text-gray-700">{subtitle}</span>
                <span className="text-xs text-gray-500">•</span>
                <span className="text-xs text-gray-500">{reviewCount} {reviewCount === 1 ? 'Review' : 'Reviews'}</span>
              </div>
            </div>
          </div>
          

          <div className="flex flex-col gap-1.5 mb-3 text-[13px] font-medium text-gray-700">
            {ratings.map(({ label, value }) => (
              <div
                key={label}
                className="flex items-center justify-between bg-gray-100 px-2.5 py-1 rounded-md shadow-sm"
              >
                <span className="truncate">{label}:</span>
                <div className="flex items-center gap-1">
                  <StarRating rating={value} color={deptProps.color}/>
                  <span className="text-xs font-semibold text-gray-800">
                    {value.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>

                    
          <div className="grid grid-cols-2 gap-y-2 gap-x-4 mt-3">
            <div className="flex items-center text-sm text-gray-600">
              <BookOpen className="mr-2 h-4 w-4 text-gray-500" />
              <span>{subtext} {type === 'course' ? `Credits` : ``}</span>
            </div>
            {type === 'course' ? 
              <div className="flex items-center text-sm text-gray-600">
                <Users className="mr-2 h-4 w-4 text-gray-500" />
                <span>{count} Professors</span>
              </div>
              : 
              <div>
            </div>

            }
          </div>
        </CardContent>
        
        <CardFooter className="px-4 py-3 bg-gray-50 flex justify-between items-center border-t border-gray-100 group-hover:bg-gray-100 transition-colors duration-200">
          <div className="text-sm font-medium text-primary">View {type.charAt(0).toUpperCase() + type.slice(1)} Details</div>
          <div className="p-1 rounded-full bg-white shadow-sm group-hover:translate-x-0.5 transition-all duration-200">
            <ChevronRight className="h-4 w-4 text-primary" />
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}