import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { extractThemes, isAIServiceConfigured } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    const { courseId, courseCode } = await request.json();

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Check if AI service is configured
    if (!isAIServiceConfigured()) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      );
    }

    // Fetch reviews for the course
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('comment, rating_value, difficulty_rating, workload_rating')
      .eq('target_id', courseId)
      .eq('target_type', 'course')
      .not('comment', 'is', null)
      .limit(100);

    if (reviewsError) {
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      );
    }

    if (!reviews || reviews.length === 0) {
      return NextResponse.json({
        themes: []
      });
    }

    // Use centralized AI service to extract themes
    const result = await extractThemes(reviews, 'course');

    if (!result.success) {
      console.error('Theme extraction error:', result.error);
      return NextResponse.json(
        { error: result.error || 'Failed to extract themes' },
        { status: 500 }
      );
    }

    console.log('Theme extraction - Success:', result.data?.length, 'themes extracted');

    return NextResponse.json({
      themes: result.data || [],
      reviewCount: reviews.length
    });

  } catch (error) {
    console.error('Error extracting themes:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    );
  }
}

