'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Tooltip } from '@mui/material';
import Slider from '@mui/material/Slider';
import Box from '@mui/material/Box';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

// ⭐ STAR SELECTOR LOGIC - same as yours
const StarSelector = ({ rating, setRating }: { rating: number; setRating: (val: number) => void }) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    const isFull = (hovered ?? rating) >= i;
    const isHalf = (hovered ?? rating) === i - 0.5;

    let starColor = 'text-gray-300';
    if (isFull) starColor = 'text-yellow-400';

    const id = `half-grad-${i}`;

    stars.push(
      <div key={i} className="relative w-6 h-6" onMouseLeave={() => setHovered(null)}>
        <Tooltip title={`${hovered ?? rating} stars`} placement="top" arrow>
          <div className="relative w-full h-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`w-6 h-6 transition-transform duration-150 ${starColor} ${hovered !== null ? 'scale-110' : ''}`}
              viewBox="0 0 24 24"
              fill={isHalf ? `url(#${id})` : 'currentColor'}
            >
              {isHalf && (
                <defs>
                  <linearGradient id={id}>
                    <stop offset="50%" stopColor="rgb(250, 204, 21)" />
                    <stop offset="50%" stopColor="#d1d5db" />
                  </linearGradient>
                </defs>
              )}
              <path d="M12 17.27L18.18 21 16.54 13.97 
                22 9.24 14.81 8.63 12 2 9.19 8.63 
                2 9.24 7.46 13.97 5.82 21z" />
            </svg>
            <div
              onMouseEnter={() => setHovered(i - 0.5)}
              onClick={() => setRating(i - 0.5)}
              className="absolute left-0 top-0 w-1/2 h-full z-10 cursor-pointer"
            />
            <div
              onMouseEnter={() => setHovered(i)}
              onClick={() => setRating(i)}
              className="absolute right-0 top-0 w-1/2 h-full z-10 cursor-pointer"
            />
          </div>
        </Tooltip>
      </div>
    );
  }

  return <div className="flex gap-1">{stars}</div>;
};

// ⭐ SLIDER COMPONENT - same as yours
const MSlider = ({ label, value, setValue }: { label: string; value: number; setValue: (val: number) => void }) => (
  <Box sx={{ width: '100%', paddingY: 1 }}>
    <label className="text-xs font-medium block mb-1">
      {label}: <span className="text-primary font-semibold">{value}/10</span>
    </label>
    <Slider
      value={value}
      onChange={(_, newValue) => setValue(newValue as number)}
      aria-label={label}
      valueLabelDisplay="on"
      min={1}
      max={10}
      step={1}
      color="primary"
    />
  </Box>
);

const RateThisCourse = ({ courseId }: { courseId: string }) => {
  const [overallRating, setOverallRating] = useState(1);
  const [workload, setWorkload] = useState(5);
  const [difficulty, setDifficulty] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    console.log("✅ Submit button clicked");
    setSubmitting(true);

    // 🟨 STEP 1: GET SESSION
    const { data, error } = await supabase.auth.getSession();
    if (error || !data?.session) {
      console.error("❌ Session error:", error?.message);
      alert("You must be signed in.");
      setSubmitting(false);
      return;
    }

    const user = data?.session.user;
    if (!user) {
      console.error("❌ No user found in session.");
      alert("No valid user session found.");
      setSubmitting(false);
      return;
    }

    // 🟨 STEP 2: GET ANONYMOUS ID
    const { data: anonRow, error: anonError } = await supabase
      .from('users')
      .select('anonymous_id')
      .eq('auth_id', user.id)
      .single();

    if (anonError || !anonRow?.anonymous_id) {
      console.error("❌ Error fetching anonymous ID:", anonError?.message);
      alert("Could not retrieve your anonymous identity.");
      setSubmitting(false);
      return;
    }

    // 🟨 STEP 3: CHECK IF RATING ALREADY EXISTS
    const { data: existing, error: existError } = await supabase
      .from('ratings')
      .select('id')
      .eq('user_id', user.id)
      .eq('target_id', courseId)
      .single();

    if (existing) {
      console.warn("⚠️ Rating already exists for this user and course.");
      alert("You've already rated this course.");
      setSubmitting(false);
      return;
    }

    // 🟨 STEP 4: INSERT NEW RATING
    const payload = {
      user_id: user.id,
      target_id: courseId,
      target_type: 'course',
      overall_rating: overallRating,
      difficulty_rating: difficulty,
      workload_rating: workload,
      knowledge_rating: null,
      teaching_rating: null,
      approachability_rating: null,
       created_at: new Date().toISOString(),
    };

    const { error: insertError } = await supabase.from('ratings').insert(payload);
    if (insertError) {
      console.error("❌ Insert error:", insertError.message);
      alert("Something went wrong while submitting.");
    } else {
      alert("✅ Your rating was submitted successfully!");
    }

    setSubmitting(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-muted overflow-hidden">
      <div className="p-3 border-b border-muted bg-primary/5">
        <h2 className="font-semibold text-center">Rate This Course</h2>
      </div>
      <div className="p-4 space-y-4">
        <div>
          <label className="text-xs font-medium block mb-1">
            Overall Rating: <span className="text-primary font-semibold">{overallRating} / 5</span>
          </label>
          <StarSelector rating={overallRating} setRating={setOverallRating} />
        </div>
        <MSlider label="Difficulty Rating" value={difficulty} setValue={setDifficulty} />
        <MSlider label="Workload Rating" value={workload} setValue={setWorkload} />

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-primary text-white rounded-md py-2 text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit Rating'}
        </button>

        <p className="text-xs text-center text-muted-foreground font-bold">
          Note: You can submit a rating only once.
        </p>
        <p className="text-xs text-center text-muted-foreground">
          <Link href="/auth/signIn" className="underline">Sign in</Link> to leave a detailed review
        </p>
      </div>
    </div>
  );
};

export default RateThisCourse;
