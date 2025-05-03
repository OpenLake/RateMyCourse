"use client"

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StarRating } from '@/components/common/StarRating';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getReviewsByCourseId } from '@/lib/data/reviews';

interface CourseReviewsProps {
  courseId: string;
}

export default function CourseReviews({ courseId }: CourseReviewsProps) {
  const [selectedTab, setSelectedTab] = useState('all');
  const reviews = getReviewsByCourseId(courseId);
  
  const filteredReviews = selectedTab === 'all' 
    ? reviews 
    : reviews.filter(review => {
        const rating = review.overallRating;
        if (selectedTab === 'positive') return rating >= 4;
        if (selectedTab === 'neutral') return rating >= 3 && rating < 4;
        return rating < 3;
      });

  return (
    <div className="space-y-6">
      <Tabs defaultValue="all" onValueChange={setSelectedTab}>
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">
            {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
          </h3>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="positive">Positive</TabsTrigger>
            <TabsTrigger value="neutral">Neutral</TabsTrigger>
            <TabsTrigger value="negative">Negative</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="all" className="space-y-4 mt-4">
          {filteredReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
          {filteredReviews.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No reviews available.
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="positive" className="space-y-4 mt-4">
          {filteredReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
          {filteredReviews.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No positive reviews yet.
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="neutral" className="space-y-4 mt-4">
          {filteredReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
          {filteredReviews.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No neutral reviews yet.
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="negative" className="space-y-4 mt-4">
          {filteredReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
          {filteredReviews.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No negative reviews yet.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface ReviewCardProps {
  review: any;
}

function ReviewCard({ review }: ReviewCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={review.user.avatar} alt={review.user.name} />
              <AvatarFallback>{review.user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-medium">{review.user.name}</h4>
              <p className="text-xs text-muted-foreground">{review.date}</p>
            </div>
          </div>
          <StarRating rating={review.overallRating} />
        </div>
        
        <div className="space-y-4">
          <p>{review.comment}</p>
          
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-sm font-medium">Workload</p>
              <StarRating rating={review.workloadRating} size="small" />
            </div>
            <div>
              <p className="text-sm font-medium">Content</p>
              <StarRating rating={review.contentRating} size="small" />
            </div>
            <div>
              <p className="text-sm font-medium">Teaching</p>
              <StarRating rating={review.teachingRating} size="small" />
            </div>
            <div>
              <p className="text-sm font-medium">Support</p>
              <StarRating rating={review.supportRating} size="small" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}