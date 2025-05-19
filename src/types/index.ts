import { LucideIcon } from "lucide-react";
export interface User {
  id: string;
  auth_id: string;
  anonymous_id: string;
  verification_hash: string;
  salt: string;
  created_at: Date;
  updated_at: Date;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  department: string;
  credits: number;
  overall_rating: number;    
  difficulty_rating: number; 
  workload_rating: number;   
  review_count: number;      
  created_at: Date;          
  updated_at: Date;          
  
}

export interface Professor {
  id: string;
  name: string;
  post: string;
  email: string;
  department: string;
  avatar_url: string;  
  website: string | null;     
  overall_rating: number;     
  knowledge_rating: number;   
  teaching_rating: number;    
  approachability_rating: number; 
  review_count: number;       
  research_interests: string[];
  created_at: Date;           
  updated_at: Date;           
  
}

export interface ProfessorCourse {  
  professor_id: string;
  course_id: string;
}

export interface Review {
  id: string;
  anonymous_id: string;
  target_id: string;
  target_type: 'course' | 'professor';
  rating_value: number;
  comment: string | null;     
  votes: number;
  is_flagged: boolean;
  created_at: Date;
  updated_at: Date;
  
  
  difficulty_rating: number | null;    
  workload_rating: number | null;      
  knowledge_rating: number | null;     
  teaching_rating: number | null;      
  approachability_rating: number | null; 
}

export interface Vote {
  id: string;
  review_id: string;          
  anonymous_id: string;
  vote_type: 'helpful' | 'unhelpful';
  created_at: Date;
}

export interface Flag {
  id: string;
  review_id: string;          
  reason: string;
  anonymous_id: string;
  status: 'pending' | 'reviewed' | 'dismissed' | 'removed';
  created_at: Date;
}
export interface DepartmentProperties {
  id: string;
  name: string;
  color: string;
  icon: LucideIcon;
}