"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";

interface AddReviewButtonProps {
  courseId: string;
}

export default function AddReviewButton({ courseId }: AddReviewButtonProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  const [review, setReview] = useState({
    comment: "",
    overall: 0,
    workload: 0,
    content: 0,
    teaching: 0,
    support: 0,
  });

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReview({ ...review, comment: e.target.value });
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("You must be signed in to submit a review.");
      return;
    }

    setSubmitting(true);

    try {
      // 1. Get anonymous_id for current user
      const { data: anonRow, error: anonError } = await supabase
        .from("users")
        .select("anonymous_id")
        .eq("auth_id", user.id)
        .single();

      if (anonError || !anonRow) {
        toast.error("Could not fetch user details. Try again.");
        return;
      }

      const anonymousId = anonRow.anonymous_id;

      // 2. Check if review already exists
      const { data: existingReview } = await supabase
        .from("reviews")
        .select("id")
        .eq("anonymous_id", anonymousId)
        .eq("target_id", courseId)
        .eq("target_type", "course")
        .maybeSingle();

      if (existingReview) {
        // Update existing review with comment
        const { error: updateError } = await supabase
          .from("reviews")
          .update({
            comment: review.comment || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingReview.id);

        if (updateError) {
          toast.error(`Failed to update review: ${updateError.message}`);
          return;
        }
      } else {
        // No existing review - user must submit rating first
        toast.error("Please submit a rating first before adding a comment.");
        return;
      }

      toast.success("Review comment added successfully!");
      setOpen(false);
      // Reset form
      setReview({
        comment: "",
        overall: 0,
        workload: 0,
        content: 0,
        teaching: 0,
        support: 0,
      });
    } catch (err) {
      toast.error("Unexpected error. Please try again.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Write a Review</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Write a  Review</DialogTitle>
          <DialogDescription>
            Share your experience to help other students.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="comment">Your Review</Label>
            <Textarea
              id="comment"
              placeholder="Share your experience with this course/professor..."
              value={review.comment}
              onChange={handleCommentChange}
              rows={6}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
