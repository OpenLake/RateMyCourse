"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { StarRatingInput } from '@/components/common/StarRatingInput';
import { Label } from '@/components/ui/label';
// import { useToast } from '@/hooks/use-toast';

interface AddReviewButtonProps {
  courseId: string;
}

export default function AddReviewButton({ courseId }: AddReviewButtonProps) {
  const [open, setOpen] = useState(false);
  // const { toast } = useToast();
  
  const [review, setReview] = useState({
    overall: 0,
    workload: 0,
    content: 0,
    teaching: 0,
    support: 0,
    comment: '',
  });
  
  const handleRatingChange = (type: string, value: number) => {
    setReview({ ...review, [type]: value });
  };
  
  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReview({ ...review, comment: e.target.value });
  };
  
  const handleSubmit = () => {
    
    console.log('Submitting review:', review);
    
    
    // toast({
    //   title: "Review submitted!",
    //   description: "Thank you for your feedback.",
    // });
    
    setOpen(false);
    
    // Reset form
    setReview({
      overall: 0,
      workload: 0,
      content: 0,
      teaching: 0,
      support: 0,
      comment: '',
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Write a Review</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Write a Course Review</DialogTitle>
          <DialogDescription>
            Share your experience with this course to help other students.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {/* <div className="space-y-2">
            <Label htmlFor="overall-rating">Overall Rating</Label>
            <div className="flex">
              <StarRatingInput 
                id="overall-rating"
                value={review.overall} 
                onChange={(value) => handleRatingChange('overall', value)} 
              />
            </div>
          </div> */}
          

          
          <div className="space-y-2">
            <Label htmlFor="comment">Your Review</Label>
            <Textarea 
              id="comment" 
              placeholder="Share your experience with this course..."
              value={review.comment}
              onChange={handleCommentChange}
              rows={6}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit}>Submit Review</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}