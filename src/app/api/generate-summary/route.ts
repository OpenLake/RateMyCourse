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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${geminiApiKey}`,
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
                  text: `Analyze the following student reviews for ${courseTitle} (${courseCode}) and create a comprehensive summary.

Total Reviews: ${reviews.length}

Student Reviews:
${reviewsText}

Generate a well-structured summary (200-300 words) covering these sections:

Overall Experience: General sentiment and key points from students

Strengths: What students appreciated most about the course

Challenges: Common difficulties or concerns raised by students

Workload & Difficulty: Students' perception of course demands

Recommendations: Who would benefit most from taking this course

IMPORTANT FORMATTING RULES:
- Do NOT use markdown symbols like #, ##, *, **, or _
- Start each section title on its own line with the exact format "Section Name:" (with a colon)
- Write content in clear, concise paragraphs
- Use simple line breaks to separate sections
- Be balanced, objective, and professional
- Provide specific insights based on the reviews`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_NONE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_NONE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_NONE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_NONE"
            }
          ]
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API error status:', geminiResponse.status);
      console.error('Gemini API error:', errorText);
      return NextResponse.json(
        { error: `Gemini API error: ${geminiResponse.status} - ${errorText.substring(0, 100)}` },
        { status: 500 }
      );
    }

    const geminiData = await geminiResponse.json();
    const summary = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 
                    'Unable to generate summary at this time.';

    console.log('Generated summary length:', summary.length);
    console.log('Summary preview:', summary.substring(0, 200));
    console.log('Finish reason:', geminiData.candidates?.[0]?.finishReason);

    return NextResponse.json({
      summary,
      hasReviews: true,
      reviewCount: reviews.length
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
