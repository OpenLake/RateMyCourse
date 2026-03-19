import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateSummary, isAIServiceConfigured } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    const { courseId, courseCode, courseTitle } = await request.json();
    const safeCourseTitle = courseTitle || courseCode || 'this course';

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
      .select('comment, rating_value, difficulty_rating, workload_rating, created_at')
      .eq('target_id', courseId)
      .eq('target_type', 'course')
      .not('comment', 'is', null)
      .order('created_at', { ascending: false })
      .limit(50);

    if (reviewsError) {
      return NextResponse.json(
        { error: 'Failed to fetch reviews' },
        { status: 500 }
      );
    }

    // Use centralized AI service to generate summary
    const safeReviews = reviews || [];

    const result = await generateSummary(
      safeReviews,
      { title: safeCourseTitle, code: courseCode },
      'course'
    );

    if (!result.success) {
      console.error('Summary generation error:', result.error);
      return NextResponse.json(
        { error: result.error || 'Failed to generate summary' },
        { status: 500 }
      );
    }

    console.log('Generated summary length:', result.data?.length);

    return NextResponse.json({
      summary: result.data,
      hasReviews: safeReviews.length > 0,
      reviewCount: safeReviews.length
    });

  } catch (error) {
    console.error('Error generating course summary:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    );
  }
}
