'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Tooltip } from '@mui/material';
import Slider from '@mui/material/Slider';
import Box from '@mui/material/Box';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

// ---------------- STAR SELECTOR ----------------
const StarSelector = ({ rating, setRating }: { rating: number; setRating: (val: number) => void }) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    const isFull = (hovered ?? rating) >= i;
    const isHalf = (hovered ?? rating) === i - 0.5;

    let starColor = 'text-gray-300 dark:text-gray-600';
    if (isFull) starColor = 'text-yellow-400';

    const id = `half-grad-${i}`;

    stars.push(
      <div key={i} className="relative w-6 h-6" onMouseLeave={() => setHovered(null)}>
        <Tooltip title={`${hovered ?? rating} stars`} placement="top" arrow>
          <div className="relative w-full h-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`w-6 h-6 transition-transform duration-150 ${starColor} ${
                hovered !== null ? 'scale-110' : ''
              }`}
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

// ---------------- SLIDER ----------------
const MSlider = ({ label, value, setValue }: { label: string; value: number; setValue: (val: number) => void }) => (
  <Box sx={{ width: '100%', paddingY: 1 }}>
    <label className="text-xs font-medium block mb-1 text-gray-900 dark:text-gray-100">
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

// ---------------- MAIN COMPONENT ----------------
const RateThisCourse = ({ courseId }: { courseId: string }) => {
  const [overallRating, setOverallRating] = useState(1);
  const [workload, setWorkload] = useState(5);
  const [difficulty, setDifficulty] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const { user } = useAuth();

  // -------- Check on mount if rating already submitted --------
  useEffect(() => {
    const checkExistingRating = async () => {
      if (!user) return;

      const { data: anonRow } = await supabase
        .from('users')
        .select('anonymous_id')
        .eq('auth_id', user.id)
        .single();

      const anonymousId = anonRow?.anonymous_id;
      if (!anonymousId) return;

      const { data: existing } = await supabase
        .from('ratings')
        .select('id')
        .eq('anonymous_id', anonymousId)
        .eq('target_id', courseId)
        .maybeSingle();

      if (existing) {
        setHasSubmitted(true);
      }
    };

    checkExistingRating();
  }, [user, courseId]);

  // -------- Handle Submit --------
  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setSubmitting(true);

    try {
      if (!user) {
        toast.error('You must sign in to submit a rating.');
        return;
      }

      const { data: anonRow, error: anonError } = await supabase
        .from('users')
        .select('anonymous_id')
        .eq('auth_id', user.id)
        .single();

      if (anonError || !anonRow) {
        toast.error('Failed to fetch user information. Please try again.');
        return;
      }

      const anonymousId = anonRow.anonymous_id;

      const { data: existing, error: existError } = await supabase
        .from('ratings')
        .select('id')
        .eq('anonymous_id', anonymousId)
        .eq('target_id', courseId)
        .single();

      if (existing) {
        setHasSubmitted(true);
        toast('You have already submitted a rating for this course.', { icon: '⚠️' });
        return;
      }

      if (existError && existError.code !== 'PGRST116') {
        toast.error(`Error checking existing rating: ${existError.message}`);
        return;
      }

      const payload = {
        anonymous_id: anonymousId,
        target_id: courseId,
        target_type: 'course',
        overall_rating: overallRating,
        difficulty_rating: difficulty,
        workload_rating: workload,
        created_at: new Date().toISOString(),
      };

      const { error: insertError } = await supabase.from('ratings').insert(payload);

      if (insertError) {
        toast.error(`Failed to submit rating: ${insertError.message}`);
      } else {
        toast.success('Rating submitted successfully!');
        setHasSubmitted(true);
      }
    } catch (error) {
      toast.error('Unexpected error occurred. Please try again.');
      console.error('❌ Unexpected error in handleSubmit:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // -------- Render --------
  if (hasSubmitted) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-muted dark:border-gray-700 p-4 text-center">
        <p className="text-sm font-medium text-green-600 dark:text-green-400">
          You have already submitted a rating for this course.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-muted dark:border-gray-700 overflow-hidden">
      <div className="p-3 border-b border-muted dark:border-gray-700 bg-primary/5 dark:bg-primary/20">
        <h2 className="font-semibold text-center text-gray-900 dark:text-gray-100">Rate This Course</h2>
      </div>
      <div className="p-4 space-y-4">
        <div>
          <label className="text-xs font-medium block mb-1 text-gray-900 dark:text-gray-100">
            Overall Rating:{' '}
            <span className="text-primary font-semibold">{overallRating} / 5</span>
          </label>
          <StarSelector rating={overallRating} setRating={setOverallRating} />
        </div>
        <MSlider label="Difficulty Rating" value={difficulty} setValue={setDifficulty} />
        <MSlider label="Workload Rating" value={workload} setValue={setWorkload} />

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full bg-primary text-white rounded-md py-2 text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50 cursor-pointer"
          type="button"
        >
          {submitting ? 'Submitting...' : 'Submit Rating'}
        </button>

        <p className="text-xs text-center text-muted-foreground dark:text-gray-400 font-bold">
          Note: You can submit a rating only once.
        </p>
        <p className="text-xs text-center text-muted-foreground dark:text-gray-400">
          <Link href="/auth/signIn" className="underline">
            Sign in
          </Link>{' '}
          to leave a detailed review
        </p>
      </div>
    </div>
  );
};

export default RateThisCourse;
