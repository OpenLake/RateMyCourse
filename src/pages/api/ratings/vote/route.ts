import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { VoteInsert } from '@/types/supabase';

// POST /api/ratings/vote - Vote on a rating (helpful/unhelpful)
export async function POST(request: Request) {
  try {
    // Get session to verify authentication
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get JSON data from request
    const json = await request.json();
    const { ratingId, voteType } = json;
    
    // Validate required fields
    if (!ratingId) {
      return NextResponse.json(
        { error: 'Missing rating ID' },
        { status: 400 }
      );
    }
    
    // Validate vote type
    if (voteType !== 'helpful' && voteType !== 'unhelpful') {
      return NextResponse.json(
        { error: 'Invalid vote type' },
        { status: 400 }
      );
    }
    
    // Get the anonymous ID for the authenticated user
    const { data: anonymousData, error: anonymousError } = await supabase
      .from('users')
      .select('anonymous_id')
      .eq('auth_id', session.user.id)
      .single();
    
    if (anonymousError || !anonymousData?.anonymous_id) {
      console.error('Error fetching anonymous ID:', anonymousError);
      return NextResponse.json(
        { error: 'Failed to verify anonymous identity' },
        { status: 500 }
      );
    }
    
    // Check if user has already voted on this rating
    const { data: existingVote, error: checkError } = await supabase
      .from('rating_votes')
      .select('id, vote_type')
      .eq('rating_id', ratingId)
      .eq('anonymous_id', anonymousData.anonymous_id)
      .single();
    
    // Transaction to handle vote logic
    const { data, error } = await supabaseAdmin.rpc('handle_rating_vote', {
      p_rating_id: ratingId,
      p_anonymous_id: anonymousData.anonymous_id,
      p_vote_type: voteType,
      p_existing_vote_type: existingVote?.vote_type || null
    });
    
    if (error) {
      console.error('Error processing vote:', error);
      return NextResponse.json(
        { error: 'Failed to process vote' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: {
        voteType,
        helpfulnessScore: data.new_helpfulness_score
      }
    });
    
  } catch (error) {
    console.error('Unexpected error in rating vote API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// DELETE /api/ratings/vote - Remove a vote from a rating
export async function DELETE(request: Request) {
  try {
    // Get session to verify authentication
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const ratingId = searchParams.get('ratingId');
    
    // Validate required fields
    if (!ratingId) {
      return NextResponse.json(
        { error: 'Missing rating ID' },
        { status: 400 }
      );
    }
    
    // Get the anonymous ID for the authenticated user
    const { data: anonymousData, error: anonymousError } = await supabase
      .from('users')
      .select('anonymous_id')
      .eq('auth_id', session.user.id)
      .single();
    
    if (anonymousError || !anonymousData?.anonymous_id) {
      console.error('Error fetching anonymous ID:', anonymousError);
      return NextResponse.json(
        { error: 'Failed to verify anonymous identity' },
        { status: 500 }
      );
    }
    
    // Check if user has a vote on this rating
    const { data: existingVote, error: checkError } = await supabase
      .from('rating_votes')
      .select('id, vote_type')
      .eq('rating_id', ratingId)
      .eq('anonymous_id', anonymousData.anonymous_id)
      .single();
    
    if (!existingVote) {
      return NextResponse.json(
        { error: 'No vote found to remove' },
        { status: 404 }
      );
    }
    
    // Transaction to remove vote and update helpfulness score
    const { data, error } = await supabaseAdmin.rpc('remove_rating_vote', {
      p_rating_id: ratingId,
      p_anonymous_id: anonymousData.anonymous_id,
      p_vote_type: existingVote.vote_type
    });
    
    if (error) {
      console.error('Error removing vote:', error);
      return NextResponse.json(
        { error: 'Failed to remove vote' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: {
        helpfulnessScore: data.new_helpfulness_score
      }
    });
    
  } catch (error) {
    console.error('Unexpected error in rating vote API:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}