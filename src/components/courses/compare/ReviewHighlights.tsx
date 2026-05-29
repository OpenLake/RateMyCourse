'use client';

import { useEffect, useState } from 'react';
import { Course } from '@/types';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, ThumbsDown, MessageSquare, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Review {
  id: string;
  comment: string | null;
  rating_value: number;
  difficulty_rating: number | null;
  workload_rating: number | null;
  created_at: string;
}

interface ReviewHighlightsProps {
  courses: Course[];
}

export default function ReviewHighlights({ courses }: ReviewHighlightsProps) {
  const [reviewsData, setReviewsData] = useState<Record<string, Review[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      if (courses.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const reviewsByUUID: Record<string, Review[]> = {};

      // Fetch UUIDs for all course codes
      const { data: courseUUIDs, error: uuidError } = await supabase
        .from('courses')
        .select('id, code')
        .in('code', courses.map((c) => c.code.toUpperCase()));

      if (uuidError) {
        console.error('Error fetching course UUIDs:', uuidError);
        setLoading(false);
        return;
      }

      // Create a map of course code to UUID
      const codeToUUID: Record<string, string> = {};
      courseUUIDs?.forEach((c) => {
        codeToUUID[c.code] = c.id;
      });

      // Fetch reviews for each course UUID
      for (const course of courses) {
        const uuid = codeToUUID[course.code.toUpperCase()];
        if (!uuid) continue;

        const { data, error } = await supabase
          .from('reviews')
          .select('id, comment, rating_value, difficulty_rating, workload_rating, created_at')
          .eq('target_id', uuid)
          .eq('target_type', 'course')
          .not('comment', 'is', null)
          .order('created_at', { ascending: false })
          .limit(10);

        if (!error && data) {
          reviewsByUUID[course.id] = data;
        }
      }

      setReviewsData(reviewsByUUID);
      setLoading(false);
    };

    fetchReviews();
  }, [courses]);

  const analyzeReviews = (reviews: Review[]) => {
    if (!reviews || reviews.length === 0) {
      return { pros: [], cons: [], topReviews: [] };
    }

    const positiveReviews = reviews.filter((r) => r.rating_value >= 4);
    const negativeReviews = reviews.filter((r) => r.rating_value <= 2);

    // Get top positive comments
    const pros = positiveReviews
      .filter((r) => r.comment && r.comment.trim().length > 20)
      .slice(0, 3)
      .map((r) => r.comment);

    // Get top negative comments
    const cons = negativeReviews
      .filter((r) => r.comment && r.comment.trim().length > 20)
      .slice(0, 3)
      .map((r) => r.comment);

    // Get most recent reviews
    const topReviews = reviews
      .filter((r) => r.comment && r.comment.trim().length > 20)
      .slice(0, 3);

    return { pros, cons, topReviews };
  };

  if (courses.length === 0) {
    return null;
  }

  if (loading) {
    return (
      <Card className="border-border/60 bg-card/40 backdrop-blur-sm">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-2">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-sm text-muted-foreground">
              Loading review highlights...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 bg-card/40 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          💬 Review Highlights
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Key insights from student reviews for each course
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={courses[0]?.id} className="w-full">
          <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${courses.length}, 1fr)` }}>
            {courses.map((course) => (
              <TabsTrigger key={course.id} value={course.id} className="font-mono text-xs">
                {course.code}
              </TabsTrigger>
            ))}
          </TabsList>
          {courses.map((course) => {
            const reviews = reviewsData[course.id] || [];
            const { pros, cons, topReviews } = analyzeReviews(reviews);

            return (
              <TabsContent key={course.id} value={course.id} className="space-y-4 mt-4">
                {/* Course Title */}
                <div className="mb-4">
                  <h3 className="font-bold text-lg">{course.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'} analyzed
                  </p>
                </div>

                {reviews.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No reviews available for this course yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Pros */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <ThumbsUp className="h-5 w-5 text-green-500" />
                        <h4 className="font-bold">Positive Feedback</h4>
                      </div>
                      {pros.length > 0 ? (
                        <div className="space-y-2">
                          {pros.map((comment, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-lg bg-green-500/10 border border-green-500/20"
                            >
                              <p className="text-sm line-clamp-3">{comment}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          No positive reviews found
                        </p>
                      )}
                    </div>

                    {/* Cons */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <ThumbsDown className="h-5 w-5 text-red-500" />
                        <h4 className="font-bold">Areas for Improvement</h4>
                      </div>
                      {cons.length > 0 ? (
                        <div className="space-y-2">
                          {cons.map((comment, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-lg bg-red-500/10 border border-red-500/20"
                            >
                              <p className="text-sm line-clamp-3">{comment}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          No critical reviews found
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Recent Reviews */}
                {topReviews.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <h4 className="font-bold flex items-center gap-2">
                      <MessageSquare className="h-5 w-5" />
                      Recent Reviews
                    </h4>
                    <div className="space-y-2">
                      {topReviews.map((review) => (
                        <div
                          key={review.id}
                          className="p-4 rounded-lg bg-muted/40 border border-border/40"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">
                                ⭐ {review.rating_value}/5
                              </Badge>
                              {review.difficulty_rating && (
                                <Badge variant="outline">
                                  Difficulty: {review.difficulty_rating}/5
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
}
