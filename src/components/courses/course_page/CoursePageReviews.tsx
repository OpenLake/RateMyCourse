import React from 'react'
import AddReviewButton from '../AddReviewButton'
import { ChevronRight, Star } from 'lucide-react'

interface CoursePageReviewsProps {
    id: string;
    reviewCount: number;
}

const StarRating = ({ rating }: { rating: number }) => {
  const filledStars = Math.floor(rating);
  const hasHalfStar = rating - filledStars >= 0.5;
  const emptyStars = 5 - filledStars - (hasHalfStar ? 1 : 0);
  
  return (
    <div className="flex items-center">
      {[...Array(filledStars)].map((_, i) => (
        <Star key={`filled-${i}`} className="w-5 h-5 text-yellow-400" fill="currentColor" />
      ))}
      
      {hasHalfStar && (
        <Star className="w-5 h-5 text-yellow-400" fill="url(#halfGradient)" />
      )}
      
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className="w-5 h-5 text-gray-300" />
      ))}
      
      <span className="ml-2 text-sm font-semibold">{rating.toFixed(1)}</span>
    </div>
  );
};

const CourseReviewItem = ({ review }: { review: any }) => {
  return (
    <div className="p-3 rounded-lg bg-white border shadow-sm hover:shadow-md transition-shadow h-full">
      <div className="flex items-center gap-2 mb-2">
        <img 
          src={review.user.avatar} 
          alt={review.user.name} 
          className="w-8 h-8 rounded-full object-cover"
        />
        <div>
          <h4 className="font-medium text-sm">{review.user.name}</h4>
          {/* <p className="text-xs text-gray-500">{review.semester}</p> */}
        </div>
      </div>
      
      <div className="mb-2">
        <StarRating rating={review.overallRating} />
      </div>
      
      <p className="text-xs text-gray-700 line-clamp-3">{review.comment}</p>
    </div>
  );
};
const CoursePageReviews = ({id, reviewCount}: CoursePageReviewsProps) => {
    const reviews = [
        {
          id: "1",
          courseId: id,
          courseName: id,
          courseCode: id,
          semester: "Spring 2025",
          overallRating: 4.5,
          workloadRating: 3.5,
          contentRating: 4.8,
          teachingRating: 4.2,
          supportRating: 3.9,
          comment: "Excellent course overall. The professor was engaging and the content was relevant.",
          date: "April 15, 2025",
          user: {
            id: "user1",
            name: "Emma W.",
            avatar: "/api/placeholder/40/40",
          }
        },
        {
          id: "2",
          courseId: id,
          courseName: id,
          courseCode: id,
          semester: "Fall 2024",
          overallRating: 3.8,
          workloadRating: 4.2,
          contentRating: 3.5,
          teachingRating: 3.9,
          supportRating: 3.7,
          comment: "Good course but the workload was heavy at times.",
          date: "December 8, 2024",
          user: {
            id: "user2",
            name: "James S.",
            avatar: "/api/placeholder/40/40",
          }
        },
        {
          id: "3",
          courseId: id,
          courseName: id,
          courseCode: id,
          semester: "Winter 2024",
          overallRating: 4.2,
          workloadRating: 3.8,
          contentRating: 4.5,
          teachingRating: 4.0,
          supportRating: 4.1,
          comment: "Very informative and well-structured id recommend!",
          date: "February 20, 2024",
          user: {
            id: "user3",
            name: "Alex J.",
            avatar: "/api/placeholder/40/40",
          }
        },
        {
          id: "4",
          courseId: id,
          courseName: id,
          courseCode: id,
          semester: "Spring 2024",
          overallRating: 4.7,
          workloadRating: 3.6,
          contentRating: 4.9,
          teachingRating: 4.5,
          supportRating: 4.2,
          comment: "One of the best courses I've taken. Great professor and engaging material.",
          date: "May 5, 2024",
          user: {
            id: "user4",
            name: "Sarah L.",
            avatar: "/api/placeholder/40/40",
          }
        }
      ];
  return (
    <div className="bg-white rounded-xl shadow-sm border border-muted overflow-hidden">
        <div className="p-3 border-b border-muted flex justify-between items-center">
        <h2 className="font-semibold">Student Reviews</h2>
        <AddReviewButton courseId={id} />
        </div>
        <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-3">
        {reviews.map((review) => (
            <CourseReviewItem key={review.id} review={review} />
        ))}
        </div>
        <div className="p-2 border-t border-muted text-center">
        <button className="text-primary hover:text-primary/80 text-sm font-medium flex items-center justify-center w-full">
            View all {reviewCount} reviews <ChevronRight className="h-4 w-4 ml-1" />
        </button>
        </div>
    </div>
  )
}

export default CoursePageReviews
