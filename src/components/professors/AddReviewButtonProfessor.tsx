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

interface AddReviewButtonProfessorProps {
  professorId: string;
}

export default function AddReviewButtonProfessor({
  professorId,
}: AddReviewButtonProfessorProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  const [review, setReview] = useState({
    comment: "",
    overall: 0,
    knowledge: 0,
    teaching: 0,
    approachability: 0,
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
      // 1. Fetch anonymous_id for current user
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

      // 2. Prepare payload (target_type = professor)
      const payload = {
        anonymous_id: anonymousId,
        target_id: professorId,
        target_type: "professor",
        rating_value: review.overall || 0,
        comment: review.comment || null,
        knowledge_rating: review.knowledge || null,
        teaching_rating: review.teaching || null,
        approachability_rating: review.approachability || null,
      };

      // 3. Insert review
      const { error: insertError } = await supabase.from("reviews").insert(payload);

      if (insertError) {
        toast.error(`Failed to submit review: ${insertError.message}`);
      } else {
        toast.success("Review submitted successfully!");
        setOpen(false);
        // Reset form
        setReview({
          comment: "",
          overall: 0,
          knowledge: 0,
          teaching: 0,
          approachability: 0,
        });
      }
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
          <DialogTitle>Write a Professor Review</DialogTitle>
          <DialogDescription>
            Share your experience to help other students choose professors.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="comment">Your Review</Label>
            <Textarea
              id="comment"
              placeholder="Share your experience with this professor..."
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
