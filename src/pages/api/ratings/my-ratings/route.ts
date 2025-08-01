
// app/api/ratings/my-ratings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  const cookieStore = cookies();
  
  // Create a Supabase client
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
  
  if (!session || !session.user) {
    return NextResponse.json(
      { error: 'Authentication required' }, 
      { status: 401 }
    );
  }

  try {
    // Get the user's anonymous ID
    const { data: verification, error: verificationError } = await supabase
      .from('anonymous_verification')
      .select('anonymous_id')
      .eq('auth_id', session.user.id)
      .single();
    
    if (verificationError || !verification) {
      return NextResponse.json(
        { error: 'Anonymous identity not found' }, 
        { status: 404 }
      );
    }
    
    // Fetch the user's ratings using their anonymous ID
    const { data: ratings, error: ratingsError } = await supabase
      .from('ratings')
      .select(`
        id,
        course_id,
        professor_id,
        rating_value,
        content,
        display_date,
        courses(name, code),
        professors(name, department)
      `)
      .eq('anonymous_id', verification.anonymous_id)
      .order('created_at', { ascending: false });
    
    if (ratingsError) {
      console.error('Error fetching user ratings:', ratingsError);
      return NextResponse.json(
        { error: 'Failed to fetch ratings' }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json({ ratings });
  } catch (error) {
    console.error('Error fetching user ratings:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}