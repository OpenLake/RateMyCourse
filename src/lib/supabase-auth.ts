// lib/supabase-auth.ts
import { createClient } from '@supabase/supabase-js';
import { generateAnonymousIdentity, verifyAnonymousIdentity, AnonymousUser } from './anonymization';
import * as crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Handle user sign-in with magic link while maintaining complete anonymity
 */
export const signInWithMagicLink = async (email: string): Promise<{error: any | null}> => {
  // First, send the magic link email
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  
  return { error };
};

/**
 * Process after user clicks magic link and handle anonymous identity creation
 */
export const handleAuthCallback = async (): Promise<{user: any, anonymousId: string | null, error: any | null}> => {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session?.user?.email) {
    return { user: null, anonymousId: null, error: error || new Error('No session found') };
  }
  
  const { anonymousId, verificationToken } = await generateAnonymousIdentity(session.user.email);
  
  // Add additional entropy with a second salt layer
  const secondarySalt = crypto.randomBytes(32).toString('hex');
  
  // Double hash the verification token with the second salt
  const doubleHashedToken = crypto.pbkdf2Sync(
    verificationToken, 
    secondarySalt, 
    50000, // Additional iterations
    64, 
    'sha512'
  ).toString('hex');
  
  // Store the verification data with double hashing
  const { error: dbError } = await supabase
    .from('anonymous_verification')
    .insert({
      auth_id: session.user.id,
      anonymous_id: anonymousId,
      verification_hash: doubleHashedToken,
      salt: secondarySalt, 
      created_at: new Date()
    });
  
  if (dbError) {
    return { user: session.user, anonymousId: null, error: dbError };
  }
  
  return {
    user: session.user,
    anonymousId,
    error: null
  };
};

/**
 * Get user's anonymous ID without exposing their email
 */
export const getAnonymousId = async (): Promise<{anonymousId: string | null, error: any | null}> => {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session?.user?.id) {
    return { anonymousId: null, error: error || new Error('No session found') };
  }
  
  // Query the verification table using auth ID
  const { data, error: dbError } = await supabase
    .from('anonymous_verification')
    .select('anonymous_id')
    .eq('auth_id', session.user.id)
    .single();
  
  if (dbError || !data) {
    return { anonymousId: null, error: dbError || new Error('No anonymous ID found') };
  }
  
  return { anonymousId: data.anonymous_id, error: null };
};
