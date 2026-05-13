/**
 * Review from database - matches the reviews table schema
 */
export interface Review {
  courseId: string;
  courseName: string;
  courseCode: string;
  semester: string;
  overallRating: number;
  workloadRating: number;
  contentRating: number;
  teachingRating: number;
  supportRating: number;
  comment: string;
  date: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
}

/**
 * Vote from database - matches the votes table schema
 */
export interface Vote {
  id: string;
  review_id: string;
  anonymous_id: string;
  vote_type: 'helpful' | 'unhelpful';
  created_at: string;
}

/**
 * User vote status for a review
 */
export type VoteType = 'helpful' | 'unhelpful' | null;

/**
 * Review with additional computed/joined data for display
 */
export interface ReviewWithUserVote extends Review {
  userVote?: VoteType; // Current user's vote on this review
  anonymousName?: string; // Generated name like "Student 1234"
}

/**
 * Input for creating a new course review
 */
export interface CreateCourseReviewInput {
  target_id: string; // Course UUID
  rating_value: number; // Overall rating 1-5
  difficulty_rating: number; // 1-5
  workload_rating: number; // 1-5
  comment?: string | null;
}

/**
 * Input for creating a new professor review
 */
export interface CreateProfessorReviewInput {
  target_id: string; // Professor UUID
  rating_value: number; // Overall rating 1-5
  knowledge_rating: number; // 1-5
  teaching_rating: number; // 1-5
  approachability_rating: number; // 1-5
  comment?: string | null;
}

/**
 * API response for voting
 */
export interface VoteResponse {
  success: boolean;
  action: 'created' | 'updated' | 'removed' | 'deleted';
  vote_type: VoteType;
  error?: string;
}

/**
 * API response for fetching user votes
 */
export interface UserVotesResponse {
  success: boolean;
  votes: Record<string, VoteType>; // Map of review_id -> vote_type
  error?: string;
}