// import React from 'react'
// import AddReviewButton from './AddReviewButton'
// import { ChevronRight } from 'lucide-react'
// import { StarRating } from '../common/StarRating';

// // CourseReviewItem component
// const CourseReviewItem = ({ review }: { review: any }) => {
//     return (
//       <div className="p-3 rounded-lg bg-white border shadow-sm hover:shadow-md transition-shadow h-full">
//         <div className="flex items-center gap-2 mb-2">
//           <img 
//             src={review.user.avatar} 
//             alt={review.user.name} 
//             className="w-8 h-8 rounded-full object-cover"
//           />
//           <div>
//             <h4 className="font-medium text-sm">{review.user.name}</h4>
//             <p className="text-xs text-gray-500">{review.semester}</p>
//           </div>
//         </div>
        
//         <div className="mb-2">
//           <StarRating rating={review.overallRating} />
//         </div>
        
//         <p className="text-xs text-gray-700 line-clamp-3">{review.comment}</p>
//       </div>
//     );
//   };

// const StudentReviews = () => {
    
//   return (
//     <div className="bg-white rounded-xl shadow-sm border border-muted overflow-hidden">
//         <div className="p-3 border-b border-muted flex justify-between items-center">
//         <h2 className="font-semibold">Student Reviews</h2>
//         <AddReviewButton courseId={course.id} />
//         </div>
//         <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-3">
//         {reviews.map((review) => (
//             <CourseReviewItem key={review.id} review={review} />
//         ))}
//         </div>
//         <div className="p-2 border-t border-muted text-center">
//         <button className="text-primary hover:text-primary/80 text-sm font-medium flex items-center justify-center w-full">
//             View all {course.reviewCount} reviews <ChevronRight className="h-4 w-4 ml-1" />
//         </button>
//         </div>
//     </div>
//   )
// }

// export default StudentReviews
