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
                  text: `You must return ONLY a JSON array. No explanations.

Reviews:
${reviewsText}

Return 6-8 themes as JSON array:
[{"tag":"theme name","count":number,"sentiment":"positive|negative|neutral"}]

Example output:
[
{"tag":"Heavy Workload","count":5,"sentiment":"negative"},
{"tag":"Engaging Lectures","count":3,"sentiment":"positive"}
]`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            topK: 10,
            topP: 0.8,
            maxOutputTokens: 4096,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_NONE",
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_NONE",
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_NONE",
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_NONE",
            },
          ],
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
    const rawResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    const finishReason = geminiData.candidates?.[0]?.finishReason;
    
    console.log('Theme extraction - Response length:', rawResponse.length);
    console.log('Theme extraction - Finish reason:', finishReason);
    console.log('Theme extraction - Raw response preview:', rawResponse.substring(0, 150));
    
    // Parse the JSON response from Gemini
    let themes = [];
    try {
      // Clean up the response in case Gemini adds markdown code blocks
      let cleanedResponse = rawResponse
        .replace(/```json\s*/g, '')
        .replace(/```\s*/g, '')
        .trim();
      
      // If response is incomplete (MAX_TOKENS), try to fix it
      if (finishReason === 'MAX_TOKENS' && !cleanedResponse.endsWith(']')) {
        // Try to close the JSON array properly
        cleanedResponse = cleanedResponse.replace(/,\s*$/, '') + ']';
      }
      
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Internal server error: ${errorMessage}` },
      { status: 500 }
    );
  }
}

