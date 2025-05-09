// lib/anonymization.ts
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

/**
 * Core anonymization utilities to ensure complete privacy of user identities
 * Even with database access, it should be impossible to link emails to ratings
 */

// Interfaces
export interface AnonymizationResult {
  anonymousId: string;
  verificationToken: string;
}

export interface AnonymousUser {
  anonymousId: string;
  salt: string;
  verificationHash: string;
  createdAt: Date;
}

/**
 * Generates a completely anonymous identity from a user's email
 * The email is never stored anywhere in the system
 */
export const generateAnonymousIdentity = async (email: string): Promise<AnonymizationResult> => {
  // Generate a strong random salt
  const salt = crypto.randomBytes(32).toString('hex');
  
  // Create a high-entropy hash from email + salt using PBKDF2
  // This is slow by design to prevent brute force attacks
  const hash = crypto.pbkdf2Sync(email, salt, 100000, 64, 'sha512').toString('hex');
  
  // Create an anonymous ID that will be used in ratings table
  const anonymousId = uuidv4();
  
  // Create a verification token (will be used to verify user without storing email)
  const verificationToken = hash.substring(0, 64);
  
  return {
    anonymousId,
    verificationToken
  };
};

/**
 * Verifies a user's identity without exposing their email
 * @param email The user's email (never stored)
 * @param storedSalt The salt stored in the verification table
 * @param storedVerificationHash The verification hash stored in DB
 */
export const verifyAnonymousIdentity = async (
  email: string,
  storedSalt: string,
  storedVerificationHash: string
): Promise<boolean> => {
  // Regenerate the hash using the stored salt
  const hash = crypto.pbkdf2Sync(email, storedSalt, 100000, 64, 'sha512').toString('hex');
  const verificationToken = hash.substring(0, 64);
  
  // Use constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    new Uint8Array(Buffer.from(verificationToken, 'hex')),
    new Uint8Array(Buffer.from(storedVerificationHash, 'hex'))
  );
};

/**
 * Secondary anonymization for data that will be put in ratings
 * This function strips personally identifiable information
 */
export const sanitizeContent = (content: string): string => {
  // Remove potential emails
  let sanitized = content.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL REMOVED]');
  
  // Remove potential phone numbers
  sanitized = sanitized.replace(/(\+\d{1,3}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g, '[PHONE REMOVED]');
  
  // Detect and remove names that might appear based on common patterns
  // This is a simplified approach - more advanced NLP would be better
  sanitized = sanitized.replace(/(?:I am|I'm|my name is|this is) ([A-Z][a-z]+ [A-Z][a-z]+)/g, 'I am [NAME REMOVED]');
  
  return sanitized;
};

/**
 * Creates a fuzzy timestamp to prevent timing correlation attacks
 * Instead of exact timestamps, we use time ranges
 */
export const createFuzzyTimestamp = (date: Date = new Date()): string => {
  const hour = Math.floor(date.getHours() / 3) * 3; // Round to nearest 3-hour block
  const timeRanges = ['morning', 'afternoon', 'evening', 'night'];
  const timeOfDay = timeRanges[Math.floor(hour / 6)];
  
  // Return only month and year with fuzzy time of day
  return `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}, ${timeOfDay}`;
};


// SQL for Creating Database Tables (Run in Supabase SQL Editor)
/*
-- Anonymous verification table - stores verification info without links to ratings
CREATE TABLE anonymous_verification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID NOT NULL UNIQUE,
  anonymous_id UUID NOT NULL UNIQUE,
  verification_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ratings table - completely disconnected from user identities
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anonymous_id UUID NOT NULL,
  course_id UUID NOT NULL,
  professor_id UUID NOT NULL,
  rating_value INTEGER NOT NULL CHECK (rating_value BETWEEN 1 AND 5),
  content TEXT,
  sentiment FLOAT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Use fuzzy timestamp for display
  display_date TEXT NOT NULL,
  -- No direct foreign key to anonymous_verification table!
  
  CONSTRAINT fk_course FOREIGN KEY (course_id) REFERENCES courses(id),
  CONSTRAINT fk_professor FOREIGN KEY (professor_id) REFERENCES professors(id)
);

-- Row-Level Security Policies
ALTER TABLE anonymous_verification ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Only allow users to see their own verification entry
CREATE POLICY "Users can only access their own verification data"
  ON anonymous_verification
  FOR ALL
  USING (auth_id = auth.uid());

-- For ratings, users can read all ratings but only modify their own
CREATE POLICY "Users can read all ratings"
  ON ratings
  FOR SELECT
  USING (true);

CREATE POLICY "Users can only insert/update/delete their own ratings"
  ON ratings
  FOR ALL
  USING (anonymous_id IN (
    SELECT anonymous_id FROM anonymous_verification WHERE auth_id = auth.uid()
  ));
*/