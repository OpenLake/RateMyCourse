"use client";

import React, { useEffect, useState } from "react";
import AddReviewButtonProfessor from "@/components/professors/AddReviewButtonProfessor";

import { ChevronRight, ChevronDown } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ProfessorPageReviewsProps {
  id: string; // Professor ID
  reviewCount: number;
}

/* Single Review Card */
const ProfessorReviewItem = ({ review }: { review: any }) => {
  const formattedDate = new Date(review.created_at).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="p-3 rounded-lg bg-white border shadow-sm hover:shadow-md transition-shadow h-full">
      <div className="flex flex-col mb-2">
        <h4 className="font-medium text-sm">{review.anonymous_id || "Anonymous"}</h4>
        <span className="text-xs text-gray-500">{formattedDate}</span>
      </div>
      <p className="text-xs text-gray-700">{review.comment || "No comment provided."}</p>
    </div>
  );
};

/* Main Reviews Component */
const ProfessorPageReviews = ({ id, reviewCount }: ProfessorPageReviewsProps) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);

      // Fetch all reviews for professor
      const { data, error } = await supabase
        .from("reviews")
        .select(`
          id,
          anonymous_id,
          comment,
          created_at
        `)
        .eq("target_id", id)
        .eq("target_type", "professor")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching professor reviews:", error.message);
      } else {
        setReviews(data || []);
      }

      setLoading(false);
    };

    fetchReviews();
  }, [id]);

  // Show only 3 unless expanded
  const displayedReviews = showAll ? reviews : reviews.slice(0, 3);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-muted overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-muted flex justify-between items-center">
        <h2 className="font-semibold">Student Reviews</h2>
       <AddReviewButtonProfessor professorId={id} />

      </div>

      {/* Reviews List */}
      <div className="p-3 space-y-3">
        {loading ? (
          <p className="text-sm text-gray-500">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-gray-500">No reviews yet for this professor.</p>
        ) : (
          displayedReviews.map((review) => (
            <ProfessorReviewItem key={review.id} review={review} />
          ))
        )}
      </div>

      {/* View All Toggle */}
      {reviews.length > 3 && (
        <div
          onClick={() => setShowAll(!showAll)}
          className="p-2 border-t border-muted text-center cursor-pointer hover:bg-gray-50 transition"
        >
          <button className="text-primary hover:text-primary/80 text-sm font-medium flex items-center justify-center w-full">
            {showAll ? "Show less" : `View all reviews`}
            {showAll ? (
              <ChevronDown className="h-4 w-4 ml-1" />
            ) : (
              <ChevronRight className="h-4 w-4 ml-1" />
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfessorPageReviews;
