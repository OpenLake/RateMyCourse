// // components/ratings/RatingForm.tsx
// import { useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { useAuth } from '@/contexts/AuthContext';
// import { createRating, updateRating } from '@/services/rating-service';
// import { Rating } from '@/types';
// import StarRating from '@/components/ui/StarRating';

// interface RatingFormProps {
//   targetId: string;
//   targetType: 'course' | 'professor';
//   existingRating?: Rating;
//   onSuccess: () => void;
// }

// interface RatingFormData {
//   rating_value: number;
//   comment: string;
//   semester: string;
//   year: number;
// }

// export default function RatingForm({ 
//   targetId, 
//   targetType, 
//   existingRating,
//   onSuccess 
// }: RatingFormProps) {
//   const { user, anonymousId } = useAuth();
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [starRating, setStarRating] = useState(existingRating?.rating_value || 0);
  
//   const { register, handleSubmit, formState: { errors } } = useForm<RatingFormData>({
//     defaultValues: existingRating ? {
//       rating_value: existingRating.rating_value,
//       comment: existingRating.comment,
//       semester: existingRating.semester,
//       year: existingRating.year
//     } : undefined
//   });
  
//   const onSubmit = async (data: RatingFormData) => {
//     if (!user || !anonymousId) {
//       setError('You must be signed in to submit a rating');
//       return;
//     }
    
//     if (!user.emailVerified) {
//       setError('Please verify your email before submitting a rating');
//       return;
//     }
    
//     setLoading(true);
//     setError(null);
    
//     try {
//       // Include the star rating in the data
//       const ratingData = {
//         ...data,
//         rating_value: starRating,
//         target_id: targetId,
//         target_type: targetType,
//         anonymous_id: anonymousId
//       };
      
//       if (existingRating) {
//         // Update existing rating
//         await updateRating(existingRating.id, anonymousId, ratingData);
//       } else {
//         // Create new rating
//         await createRating(ratingData);
//       }
      
//       onSuccess();
//     } catch (err: any) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   const currentYear = new Date().getFullYear();
//   const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  
//   return (
//     <div className="bg-white rounded-lg shadow-md p-6">
//       <h3 className="text-xl font-semibold mb-4">
//         {existingRating ? 'Edit Your Rating' : `Rate this ${targetType}`}
//       </h3>
      
//       {error && (
//         <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
//           {error}
//         </div>
//       )}
      
//       <form onSubmit={handleSubmit(onSubmit)}>
//         <div className="mb-6">
//           <label className="block text-gray-700 mb-2">Your Rating</label>
//           <div className="flex items-center">
//             <StarRating 
//               rating={starRating} 
//               size="lg" 
//               editable={true} 
//               onChange={setStarRating} 
//             />
//             <span className="ml-3 text-gray-600">
//               {starRating === 0 ? 'Select a rating' : `${starRating} out of 5`}
//             </span>
//           </div>
//           {starRating === 0 && (
//             <p className="text-red-500 text-sm mt-1">Please select a rating</p>
//           )}
//         </div>
        
//         <div className="mb-4">
//           <label className="block text-gray-700 mb-2" htmlFor="comment">
//             Your Review
//           </label>
//           <textarea
//             id="comment"
//             rows={4}
//             className="w-full p-2 border rounded"
//             placeholder={`Share your experience with this ${targetType}...`}
//             {...register("comment", { 
//               required: "Please provide a review", 
//               minLength: {
//                 value: 20,
//                 message: "Review must be at least 20 characters"
//               },
//               maxLength: {
//                 value: 1000,
//                 message: "Review cannot exceed 1000 characters"
//               }
//             })}
//           />
//           {errors.comment && (
//             <p className="text-red-500 text-sm mt-1">{errors.comment.message}</p>
//           )}
//           <p className="text-gray-500 text-xs mt-1">
//             Do not include personally identifiable information in your review.
//           </p>
//         </div>
        
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
//           <div>
//             <label className="block text-gray-700 mb-2" htmlFor="semester">
//               Semester
//             </label>
//             <select
//               id="semester"
//               className="w-full p-2 border rounded"
//               {...register("semester", { required: "Please select a semester" })}
//             >
//               <option value="">Select Semester</option>
//               <option value="Spring">Spring</option>
//               <option value="Summer">Summer</option>
//               <option value="Autumn">Autumn</option>
//               <option value="Winter">Winter</option>
//             </select>
//             {errors.semester && (
//               <p className="text-red-500 text-sm mt-1">{errors.semester.message}</p>
//             )}
//           </div>
          
//           <div>
//             <label className="block text-gray-700 mb-2" htmlFor="year">
//               Year
//             </label>
//             <select
//               id="year"
//               className="w-full p-2 border rounded"
//               {...register("year", { 
//                 required: "Please select a year",
//                 valueAsNumber: true 
//               })}
//             >
//               <option value="">Select Year</option>
//               {years.map(year => (
//                 <option key={year} value={year}>{year}</option>
//               ))}
//             </select>
//             {errors.year && (
//               <p className="text-red-500 text-sm mt-1">{errors.year.message}</p>
//             )}
//           </div>
//         </div>
        
//         <div className