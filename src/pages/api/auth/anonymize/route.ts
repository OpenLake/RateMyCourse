// app/api/auth/anonymize/route.ts
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { createClient as createServerClient} from '@/utils/supabase/server';

/**
 * Server-side anonymization handler that keeps email out of client-side code entirely
 * This ensures the email never exists in browser memory or localStorage
 */
export async function POST(request: Request) {
  try {
    // Initialize Supabase server client
    const supabase = await createServerClient();
    
    // Get the current session server-side
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json(
        { error: 'Unauthorized - No valid session found' },
        { status: 401 }
      );
    }
    
    // Server-side anonymization - user's email never leaves the server
    // Generate a strong random salt
    const salt = crypto.randomBytes(32).toString('hex');
  
    // Create a high-entropy hash from email + salt using PBKDF2
    const hash = crypto.pbkdf2Sync(
      session.user.email, 
      salt, 
      100000, // High iteration count
      64, 
      'sha512'
    ).toString('hex');
    
    // Create an anonymous ID
    const anonymousId = uuidv4();
    
    // Create a verification token
    const verificationToken = hash.substring(0, 64);
    
    // Additional security layer with secondary hashing
    const secondarySalt = crypto.randomBytes(32).toString('hex');
    const doubleHashedToken = crypto.pbkdf2Sync(
      verificationToken, 
      secondarySalt, 
      50000, 
      64, 
      'sha512'
    ).toString('hex');
    
    // Store in the verification table
    const { error: dbError } = await supabase
      .from('user')
      .upsert({
        auth_id: session.user.id,
        anonymous_id: anonymousId,
        verification_hash: doubleHashedToken,
        salt: secondarySalt,
        created_at: new Date()
      });
    
    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to store anonymized identity' },
        { status: 500 }
      );
    }
    
    // Return only the anonymous ID to the client
    // Email never returns to the browser
    return NextResponse.json({ anonymousId });
    
  } catch (error) {
    console.error('Anonymization error:', error);
    return NextResponse.json(
      { error: 'Internal server error during anonymization' },
      { status: 500 }
    );
  }
}