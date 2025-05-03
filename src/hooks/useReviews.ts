// import { fetchReviews } from "@/lib/reviews";
// import { Review } from "@/types/reviews";
// import { transformReview } from "@/utils/transform";
import { useEffect, useState, useCallback } from "react";

interface ReviewsState {
  reviews: Review[];
  isLoading: boolean;
  error: Error | null;
}

export const useReviews = () => {
  const [state, setState] = useState<ReviewsState>({
    reviews: [],
    isLoading: true,
    error: null,
  });

  const reviews = [
    {
      id: "1",
      courseId: course.id,
      courseName: course.name,
      courseCode: course.code,
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
      courseId: course.id,
      courseName: course.name,
      courseCode: course.code,
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
      courseId: course.id,
      courseName: course.name,
      courseCode: course.code,
      semester: "Winter 2024",
      overallRating: 4.2,
      workloadRating: 3.8,
      contentRating: 4.5,
      teachingRating: 4.0,
      supportRating: 4.1,
      comment: "Very informative and well-structured course. Highly recommend!",
      date: "February 20, 2024",
      user: {
        id: "user3",
        name: "Alex J.",
        avatar: "/api/placeholder/40/40",
      }
    },
    {
      id: "4",
      courseId: course.id,
      courseName: course.name,
      courseCode: course.code,
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

  // Memoized fetch function with error handling
//   const fetchReviewsData = useCallback(async () => {
//     setState(prev => ({ ...prev, isLoading: true }));

//     try {
//       const data = await fetchReviews();
//       const transformedReviews = data
//         .map(transformReview)
//         .sort((a, b) => 
//           a.id.slice(3).localeCompare(b.id.slice(3), undefined, { numeric: true })
//         );

//       setState({
//         reviews: transformedReviews,
//         isLoading: false,
//         error: null,
//       });
//     } catch (error) {
//       setState({
//         reviews: [],
//         isLoading: false,
//         error: error instanceof Error ? error : new Error('An unknown error occurred'),
//       });
//     }
//   }, []);

  // Initial data fetch
//   useEffect(() => {
//     fetchReviewsData();
//   }, [fetchReviewsData]);

  // Expose method to manually refetch reviews
//   const refetch = useCallback(() => {
//     fetchReviewsData();
//   }, [fetchReviewsData]);


  return {
    ...state,
    // refetch,
  };
};