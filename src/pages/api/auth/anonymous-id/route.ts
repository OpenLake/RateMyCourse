// import { NextRequest, NextResponse } from 'next/server';
// import { supabase } from '@/lib/supabase';
// import { generateAnonymousId, supabaseAdmin } from '@/lib/supabase-admin';

// export async function GET(req: NextRequest) {
//   // Get current user from session
//   const { data: { session } } = await supabase.auth.getSession();
  
//   if (!session?.user) {
//     return NextResponse.json(
//       { error: 'Unauthorized' },
//       { status: 401 }
//     );
//   }
  
//   try {
//     // Try to fetch existing anonymous ID
//     const { data, error } = await supabase
//       .from('users_auth')
//       .select('anonymous_id')
//       .eq('user_id', session.user.id)
//       .single();
      
//     if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
//       throw error;
//     }
    
//     // If anonymous ID exists, return it
//     if (data?.anonymous_id) {
//       return NextResponse.json({ anonymousId: data.anonymous_id });
//     }
    
//     // Create a new anonymous ID
//     const anonymousId = generateAnonymousId();
    
//     // Store the anonymous ID
//     const { error: insertError } = await supabaseAdmin
//       .from('users_auth')
//       .insert({
//         user_id: session.user.id,
//         anonymous_id: anonymousId,
//         created_at: new Date().toISOString(),
//       });
      
//     if (insertError) {
//       throw insertError;
//     }
    
//     return NextResponse.json({ anonymousId });
//   } catch (error) {
//     console.error('Error managing anonymous ID:', error);
//     return NextResponse.json(
//       { error: 'Failed to manage anonymous ID' },
//       { status: 500 }
//     );
//   }
// }

// app/api/auth/anonymous-id/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { generateAnonymousIdentity } from '@/lib/anonymization';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  const cookieStore = cookies();
  
  // Create a Supabase client for server-side operations
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: (name, value, options) => cookieStore.set(name, value, options),
        remove: (name, options) => cookieStore.delete(name, options),
      },
    }
  );

  // Get the current session
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session || !session.user || !session.user.email) {
    return NextResponse.json(
      { error: 'Authentication required' }, 
      { status: 401 }
    );
  }

  try {
    // First check if the user already has an anonymous ID in the database
    const { data: existingVerification, error: queryError } = await supabase
      .from('anonymous_verification')
      .select('anonymous_id')
      .eq('auth_id', session.user.id)
      .single();
    
    if (existingVerification?.anonymous_id) {
      // User already has an anonymous ID
      return NextResponse.json({ anonymousId: existingVerification.anonymous_id });
    }
    
    // Generate a new anonymous identity based on the user's email
    const { anonymousId, verificationToken } = await generateAnonymousIdentity(session.user.email);
    
    // Store the anonymous identity verification in the database
    const { error: insertError } = await supabase
      .from('anonymous_verification')
      .insert({
        auth_id: session.user.id,
        anonymous_id: anonymousId,
        verification_hash: verificationToken,
        salt: crypto.randomBytes(32).toString('hex'), // Additional salt
        created_at: new Date()
      });
    
    if (insertError) {
      console.error('Error storing anonymous ID:', insertError);
      return NextResponse.json(
        { error: 'Failed to create anonymous identity' }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json({ anonymousId });
  } catch (error) {
    console.error('Error generating anonymous ID:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
