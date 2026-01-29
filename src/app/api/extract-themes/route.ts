import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { courseId, courseCode } = await request.json();

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
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

    // Prepare review comments for Gemini
    const reviewsText = reviews
      .map((r, idx) => `${idx + 1}. ${r.comment}`)
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
                  text: `Analyze these student course reviews and extract the 6-8 most common themes or topics mentioned.

Reviews:
${reviewsText}

For each theme:
1. Create a short, clear tag (2-4 words max)
2. Count how many times it appears (approximately)
3. Determine sentiment: positive, negative, or neutral

Examples of good tags:
- "Heavy Workload" (negative)
- "Engaging Lectures" (positive)
- "Tough Exams" (negative)
- "Helpful Professor" (positive)
- "Group Projects" (neutral)
- "Practical Applications" (positive)
- "Fast Paced" (neutral)

Return ONLY a valid JSON array in this exact format:
[
  {"tag": "Heavy Workload", "count": 5, "sentiment": "negative"},
  {"tag": "Engaging Lectures", "count": 3, "sentiment": "positive"}
]

Important: Return ONLY the JSON array, no other text or explanation.`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            topK: 20,
            topP: 0.8,
            maxOutputTokens: 300,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json();
      console.error('Gemini API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to extract themes' },
        { status: 500 }
      );
    }

    const geminiData = await geminiResponse.json();
    const rawResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    
    // Parse the JSON response from Gemini
    let themes = [];
    try {
      // Clean up the response in case Gemini adds markdown code blocks
      const cleanedResponse = rawResponse
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();
      
      themes = JSON.parse(cleanedResponse);
      
      // Validate and limit to top 8 themes
      themes = themes
        .filter((t: any) => t.tag && t.sentiment)
        .slice(0, 8)
        .map((t: any) => ({
          tag: t.tag,
          count: t.count || 1,
          sentiment: t.sentiment
        }));
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      console.error('Raw response:', rawResponse);
      themes = [];
    }

    return NextResponse.json({
      themes,
      reviewCount: reviews.length
    });

  } catch (error) {
    console.error('Error extracting themes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
