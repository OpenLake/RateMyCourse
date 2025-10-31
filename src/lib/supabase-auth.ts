// lib/supabase-auth.ts
import { generateAnonymousIdentity, verifyAnonymousIdentity, AnonymousUser } from './anonymization';
import * as crypto from 'crypto';
// 👇 **MODIFIED LINE: Import the original shared client**
import { supabase } from './supabase';

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
 * Process after user clicks magic link OR completes OAuth and handle anonymous identity creation
 */
export const handleAuthCallback = async (): Promise<{user: any, anonymousId: string | null, error: any | null}> => {
  // 👇 Wait until Supabase returns a session with a user ID (max 0.5 seconds)
  let session = null;
  for (let i = 0; i < 10; i++) {
    // This getSession() call will now use the correct shared client
    const { data } = await supabase.auth.getSession();
    console.log(`Callback Attempt ${i}:`, data?.session);
    session = data?.session;
    // ✅ Primarily check for user ID to confirm session
    if (session?.user?.id) break;
    // This is the 50ms delay I added last time, which is fine.
    await new Promise((r) => setTimeout(r, 50));
  }


  // ❌ Still no session with a user ID after retrying
  if (!session?.user?.id) {
    console.error('No valid session with user ID after waiting.');
    return {
      user: null,
      anonymousId: null,
      error: new Error('No valid session after waiting.'),
    };
  }

  // ❓ Check if email exists for anonymous ID generation
  if (!session.user.email) {
    console.error('Session obtained, but user email is missing.');
    return {
      user: session.user, // Return the user object we have
      anonymousId: null,
      error: new Error('User email is required for anonymous identity generation.'),
    };
  }

  // --- Proceed with anonymous identity generation and storage ---
  const { anonymousId, verificationToken } = await generateAnonymousIdentity(session.user.email);

  // Add additional entropy with a second salt layer
  const secondarySalt = crypto.randomBytes(32).toString('hex');

  // HIGHLIGHT-START
  // This is the main source of the delay.
  // Reduced iterations from 50000 to 5000 for a 10x speed boost.
  const doubleHashedToken = crypto.pbkdf2Sync(
    verificationToken,
    secondarySalt,
    5000, // Additional iterations (was 50000)
    64,
    'sha512'
  ).toString('hex');
  // HIGHLIGHT-END

  // ✅ Upsert into `users` table using the confirmed user ID
  const { error: dbError } = await supabase
    .from('users')
    .upsert(
      {
        auth_id: session.user.id, // Use the confirmed user ID
        anonymous_id: anonymousId,
        verification_hash: doubleHashedToken,
        salt: secondarySalt,
        created_at: new Date(),
      },
      { onConflict: 'auth_id' } // Use auth_id for conflict resolution
    );

  if (dbError) {
    console.error("Error upserting user:", dbError);
    return { user: session.user, anonymousId: null, error: dbError };
  }

  console.log("✅ User upserted successfully, anonymousId:", anonymousId);
  return {
    user: session.user,
    anonymousId,
    error: null,
  };
};


/**
 * Get user's anonymous ID without exposing their email
 */
export const getAnonymousId = async (): Promise<{anonymousId: string | null, error: any | null}> => {
  // This will now use the correct shared client
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error || !session?.user?.id) {
    return { anonymousId: null, error: error || new Error('No session found') };
  }

  // Query the users table using auth ID
  const { data, error: dbError } = await supabase
    .from('users')
    .select('anonymous_id')
    .eq('auth_id', session.user.id)
    .maybeSingle();

  if (dbError) {
     console.error("DB Error fetching anonymous ID:", dbError);
     return { anonymousId: null, error: dbError };
  }
  if (!data) {
      console.warn("No anonymous ID found for auth_id:", session.user.id);
      return { anonymousId: null, error: new Error('Anonymous ID not found for this user.') };
  }

  return { anonymousId: data.anonymous_id, error: null };
};