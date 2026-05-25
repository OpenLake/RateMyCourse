export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          auth_id: string
          anonymous_id: string
          verification_hash: string
          salt: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          auth_id: string
          anonymous_id: string
          verification_hash: string
          salt: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          auth_id?: string
          anonymous_id?: string
          verification_hash?: string
          salt?: string
          created_at?: string
          updated_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          code: string
          title: string
          department: string
          credits: number
          overall_rating: number
          difficulty_rating: number
          workload_rating: number
          review_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          title: string
          department: string
          credits: number
          overall_rating?: number
          difficulty_rating?: number
          workload_rating?: number
          review_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          title?: string
          department?: string
          credits?: number
          overall_rating?: number
          difficulty_rating?: number
          workload_rating?: number
          review_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      professors: {
        Row: {
          id: string
          name: string
          post: string
          email: string
          department: string
          avatar_url: string | null
          website: string | null
          overall_rating: number
          knowledge_rating: number
          teaching_rating: number
          approachability_rating: number
          review_count: number
          research_interests: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          post: string
          email: string
          department: string
          avatar_url?: string | null
          website?: string | null
          overall_rating?: number
          knowledge_rating?: number
          teaching_rating?: number
          approachability_rating?: number
          review_count?: number
          research_interests?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          post?: string
          email?: string
          department?: string
          avatar_url?: string | null
          website?: string | null
          overall_rating?: number
          knowledge_rating?: number
          teaching_rating?: number
          approachability_rating?: number
          review_count?: number
          research_interests?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      professors_courses: {
        Row: {
          professor_id: string
          course_id: string
        }
        Insert: {
          professor_id: string
          course_id: string
        }
        Update: {
          professor_id?: string
          course_id?: string
        }
      }
      reviews: {
        Row: {
          id: string
          anonymous_id: string
          target_id: string
          target_type: 'course' | 'professor'
          rating_value: number
          comment: string | null
          votes: number
          is_flagged: boolean
          created_at: string
          updated_at: string
          difficulty_rating: number | null
          workload_rating: number | null
          knowledge_rating: number | null
          teaching_rating: number | null
          approachability_rating: number | null
        }
        Insert: {
          id?: string
          anonymous_id: string
          target_id: string
          target_type: 'course' | 'professor'
          rating_value: number
          comment?: string | null
          votes?: number
          is_flagged?: boolean
          created_at?: string
          updated_at?: string
          difficulty_rating?: number | null
          workload_rating?: number | null
          knowledge_rating?: number | null
          teaching_rating?: number | null
          approachability_rating?: number | null
        }
        Update: {
          id?: string
          anonymous_id?: string
          target_id?: string
          target_type?: 'course' | 'professor'
          rating_value?: number
          comment?: string | null
          votes?: number
          is_flagged?: boolean
          created_at?: string
          updated_at?: string
          difficulty_rating?: number | null
          workload_rating?: number | null
          knowledge_rating?: number | null
          teaching_rating?: number | null
          approachability_rating?: number | null
        }
      }
      votes: {
        Row: {
          id: string
          review_id: string
          anonymous_id: string
          vote_type: 'helpful' | 'unhelpful'
          created_at: string
        }
        Insert: {
          id?: string
          review_id: string
          anonymous_id: string
          vote_type: 'helpful' | 'unhelpful'
          created_at?: string
        }
        Update: {
          id?: string
          review_id?: string
          anonymous_id?: string
          vote_type?: 'helpful' | 'unhelpful'
          created_at?: string
        }
      }
      flags: {
        Row: {
          id: string
          review_id: string
          anonymous_id: string
          reason: string
          status: 'pending' | 'reviewed' | 'dismissed' | 'removed'
          created_at: string
        }
        Insert: {
          id?: string
          review_id: string
          anonymous_id: string
          reason: string
          status?: 'pending' | 'reviewed' | 'dismissed' | 'removed'
          created_at?: string
        }
        Update: {
          id?: string
          review_id?: string
          anonymous_id?: string
          reason?: string
          status?: 'pending' | 'reviewed' | 'dismissed' | 'removed'
          created_at?: string
        }
      }
    }
    Views: {
      course_stats: {
        Row: {
          course_id: string
          review_count: number
          avg_overall: number | null
          avg_difficulty: number | null
          avg_workload: number | null
        }
      }
      professor_stats: {
        Row: {
          professor_id: string
          review_count: number
          avg_overall: number | null
          avg_knowledge: number | null
          avg_teaching: number | null
          avg_approachability: number | null
        }
      }
    }
    Functions: {
      get_course_professors: {
        Args: {
          course_id: string
        }
        Returns: {
          professor_id: string
          name: string
        }[]
      }
      get_professor_courses: {
        Args: {
          professor_id: string
        }
        Returns: {
          course_id: string
          code: string
          title: string
        }[]
      }
    }
  }
}

// Type definitions for application-level models
export type AnonymousVerification = Database['public']['Tables']['users']['Row']
export type Course = Database['public']['Tables']['courses']['Row'] & {
  rating?: {
    overall: number
    difficulty: number
    workload: number
  }
  reviewCount?: number
  professors?: {
    id: string
    name: string
  }[]
}
export type CourseInsert = Database['public']['Tables']['courses']['Insert']
export type CourseUpdate = Database['public']['Tables']['courses']['Update']

export type Professor = Database['public']['Tables']['professors']['Row'] & {
  rating?: {
    overall: number
    knowledge: number
    teaching: number
    approachability: number
  }
  reviewCount?: number
  courses?: {
    id: string
    code: string
    title: string
  }[]
}
export type ProfessorInsert = Database['public']['Tables']['professors']['Insert']
export type ProfessorUpdate = Database['public']['Tables']['professors']['Update']

export type Review = Database['public']['Tables']['reviews']['Row']
export type ReviewInsert = Database['public']['Tables']['reviews']['Insert']
export type ReviewUpdate = Database['public']['Tables']['reviews']['Update']

export type Vote = Database['public']['Tables']['votes']['Row']
export type VoteInsert = Database['public']['Tables']['votes']['Insert']

export type Flag = Database['public']['Tables']['flags']['Row']
export type FlagInsert = Database['public']['Tables']['flags']['Insert']

export type CourseStats = Database['public']['Views']['course_stats']['Row']
export type ProfessorStats = Database['public']['Views']['professor_stats']['Row']