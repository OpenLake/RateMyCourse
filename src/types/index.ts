import { LucideIcon } from "lucide-react";
export interface User {
  id: string;
  email_hash: string;
  anonymous_id: string;
  salt: string;
  verification_status: boolean;
  created_at: Date;
  last_login: Date;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  department: string;
  credits: number;
  rating: {
    overall: number;
    difficulty: number;
    workload: number;
  }
  reviewCount: number;
  professors: string[];
}  
  
export interface Professor {
  id: string;
  name: string;
  post: string;
  email: string;
  department: string;
  avatar_url: string;
  website?: string;
  rating: {
    overall: number;
    knowledge: number;
    teaching: number;
    approachability: number;
  }
  reviewCount: number;
  research_interests: string[];
  courses: string[];
}
  
export interface Rating {
  id: string;
  anonymous_id: string;
  target_id: string;
  target_type: 'course' | 'professor';
  rating_value: number;
  comment: string;
  semester: string;
  year: number;
  created_at: Date;
  updated_at: Date;
  helpfulness_score: number;
  is_flagged: boolean;
}

export interface Vote {
  id: string;
  rating_id: string;
  anonymous_id: string;
  vote_type: 'helpful' | 'unhelpful';
  created_at: Date;
}

export interface Flag {
  id: string;
  rating_id: string;
  reason: string;
  anonymous_id: string;
  status: 'pending' | 'reviewed' | 'dismissed' | 'removed';
  created_at: Date;
}

export interface AdminUser {
  id: string;
  permissions: string[];
  access_level: number;
}

export interface DepartmentProperties {
  id: string;
  name: string;
  color: string;
  icon: LucideIcon;
}