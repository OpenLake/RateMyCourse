import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { courseId, courseCode, courseTitle } = await request.json();

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
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

    if (!reviews || reviews.length === 0) {
      return NextResponse.json({
        summary: 'No reviews available yet for this course. Be the first to share your experience!',
        hasReviews: false
      });
    }

    // Prepare review data for Gemini
    const reviewsText = reviews
      .map((r, idx) => {
        return `Review ${idx + 1}:
Rating: ${r.rating_value}/5
${r.difficulty_rating ? `Difficulty: ${r.difficulty_rating}/5` : ''}
${r.workload_rating ? `Workload: ${r.workload_rating}/5` : ''}
Comment: ${r.comment}
---`;
      })
      .join('\n');

    // Call Gemini API
    const geminiApiKey = process.env.GEMINI_API_KEY;
    
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are an academic advisor analyzing student reviews for a course. 

Course: ${courseTitle} (${courseCode})
Total Reviews: ${reviews.length}

Student Reviews:
${reviewsText}

Based on these reviews, generate a concise, informative summary (150-200 words) that covers:

1. **Overall Experience**: General sentiment and key takeaways
2. **Strengths**: What students appreciated most
3. **Challenges**: Common difficulties or concerns mentioned
4. **Workload & Difficulty**: Average perception of course demands
5. **Recommendations**: Who would benefit most from this course

Write in a professional, helpful tone. Be balanced and objective. Use bullet points for clarity where appropriate.`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 500,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json();
      console.error('Gemini API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to generate summary' },
        { status: 500 }
      );
    }

    const geminiData = await geminiResponse.json();
    const summary = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 
                    'Unable to generate summary at this time.';

    return NextResponse.json({
      summary,
      hasReviews: true,
      reviewCount: reviews.length
    });

  } catch (error) {
    console.error('Error generating course summary:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
