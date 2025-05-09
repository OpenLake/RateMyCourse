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
      anonymous_verification: {
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
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          title: string
          department: string
          credits: number
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          title?: string
          department?: string
          credits?: number
          description?: string | null
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
          research_interests?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      professor_courses: {
        Row: {
          id: string
          professor_id: string
          course_id: string
          created_at: string
        }
        Insert: {
          id?: string
          professor_id: string
          course_id: string
          created_at?: string
        }
        Update: {
          id?: string
          professor_id?: string
          course_id?: string
          created_at?: string
        }
      }
      ratings: {
        Row: {
          id: string
          anonymous_id: string
          target_id: string
          target_type: 'course' | 'professor'
          rating_metrics: {
            overall: number
            difficulty?: number
            workload?: number
            knowledge?: number
            teaching?: number
            approachability?: number
          }
          comment: string | null
          semester: string
          year: number
          display_date: string
          created_at: string
          updated_at: string
          helpfulness_score: number
          is_flagged: boolean
        }
        Insert: {
          id?: string
          anonymous_id: string
          target_id: string
          target_type: 'course' | 'professor'
          rating_metrics: {
            overall: number
            difficulty?: number
            workload?: number
            knowledge?: number
            teaching?: number
            approachability?: number
          }
          comment?: string | null
          semester: string
          year: number
          display_date: string
          created_at?: string
          updated_at?: string
          helpfulness_score?: number
          is_flagged?: boolean
        }
        Update: {
          id?: string
          anonymous_id?: string
          target_id?: string
          target_type?: 'course' | 'professor'
          rating_metrics?: {
            overall: number
            difficulty?: number
            workload?: number
            knowledge?: number
            teaching?: number
            approachability?: number
          }
          comment?: string | null
          semester?: string
          year?: number
          display_date?: string
          created_at?: string
          updated_at?: string
          helpfulness_score?: number
          is_flagged?: boolean
        }
      }
      rating_votes: {
        Row: {
          id: string
          rating_id: string
          anonymous_id: string
          vote_type: 'helpful' | 'unhelpful'
          created_at: string
        }
        Insert: {
          id?: string
          rating_id: string
          anonymous_id: string
          vote_type: 'helpful' | 'unhelpful'
          created_at?: string
        }
        Update: {
          id?: string
          rating_id?: string
          anonymous_id?: string
          vote_type?: 'helpful' | 'unhelpful'
          created_at?: string
        }
      }
      rating_flags: {
        Row: {
          id: string
          rating_id: string
          anonymous_id: string
          reason: string
          status: 'pending' | 'reviewed' | 'dismissed' | 'removed'
          created_at: string
        }
        Insert: {
          id?: string
          rating_id: string
          anonymous_id: string
          reason: string
          status?: 'pending' | 'reviewed' | 'dismissed' | 'removed'
          created_at?: string
        }
        Update: {
          id?: string
          rating_id?: string
          anonymous_id?: string
          reason?: string
          status?: 'pending' | 'reviewed' | 'dismissed' | 'removed'
          created_at?: string
        }
      }
      departments: {
        Row: {
          id: string
          name: string
          code: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          color: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          color?: string
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
export type AnonymousVerification = Database['public']['Tables']['anonymous_verification']['Row']
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

export type Rating = Database['public']['Tables']['ratings']['Row']
export type RatingInsert = Database['public']['Tables']['ratings']['Insert']
export type RatingUpdate = Database['public']['Tables']['ratings']['Update']

export type Vote = Database['public']['Tables']['rating_votes']['Row']
export type VoteInsert = Database['public']['Tables']['rating_votes']['Insert']

export type Flag = Database['public']['Tables']['rating_flags']['Row']
export type FlagInsert = Database['public']['Tables']['rating_flags']['Insert']

export type Department = Database['public']['Tables']['departments']['Row']
export type DepartmentInsert = Database['public']['Tables']['departments']['Insert']

export type CourseStats = Database['public']['Views']['course_stats']['Row']
export type ProfessorStats = Database['public']['Views']['professor_stats']['Row']