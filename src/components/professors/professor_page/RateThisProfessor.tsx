'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Slider from '@mui/material/Slider';
import Box from '@mui/material/Box';
import { Tooltip } from '@mui/material';
import { Professor } from '@/types';

// StarSelector component
const StarSelector = ({
  rating,
  setRating,
}: {
  rating: number;
  setRating: (val: number) => void;
}) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    const isFull = (hovered ?? rating) >= i;
    const isHalf = (hovered ?? rating) === i - 0.5;
    let starColor = 'text-gray-300';
    if (isFull) starColor = 'text-yellow-400';
    else if (isHalf) starColor = '';

    const id = `half-grad-${i}`;
    let star = (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`w-6 h-6 transition-transform duration-150 ${starColor ?? ''} ${hovered !== null ? 'scale-110' : ''}`}
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
        <path d="M12 17.27L18.18 21 16.54 13.97 22 9.24 14.81 8.63 12 2 9.19 8.63 2 9.24 7.46 13.97 5.82 21z" />
      </svg>
    );

    stars.push(
      <div key={i} className="relative w-6 h-6" onMouseLeave={() => setHovered(null)}>
        <Tooltip title={`${hovered ?? rating} stars`} placement="top" arrow>
          <div className="relative w-full h-full">
            {star}
            <div onMouseEnter={() => setHovered(i - 0.5)} onClick={() => setRating(i - 0.5)} className="absolute left-0 top-0 w-1/2 h-full z-10 cursor-pointer" />
            <div onMouseEnter={() => setHovered(i)} onClick={() => setRating(i)} className="absolute right-0 top-0 w-1/2 h-full z-10 cursor-pointer" />
          </div>
        </Tooltip>
      </div>
    );
  }

  return <div className="flex gap-1">{stars}</div>;
};

// MSlider component
const MSlider = ({
  label,
  value,
  setValue,
}: {
  label: string;
  value: number;
  setValue: (val: number) => void;
}) => (
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
      sx={{
        height: 8,
        '& .MuiSlider-thumb': {
          height: 24,
          width: 24,
        },
        '& .MuiSlider-track': {
          border: 'none',
        },
        '& .MuiSlider-valueLabel': {
          backgroundColor: '#2563eb',
        },
      }}
    />
  </Box>
);

// RateThisProfessor main component
const RateThisProfessor = ({ professor }: { professor: Professor }) => {
  const [overallRating, setOverallRating] = useState(0);
  const [knowledge, setKnowledge] = useState(5);
  const [teaching, setTeaching] = useState(5);
  const [approachability, setApproachability] = useState(5);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-muted overflow-hidden">
      <div className="p-3 border-b border-muted bg-primary/5">
        <h2 className="font-semibold text-center">Rate This Professor</h2>
      </div>
      <div className="p-4 space-y-4">
        <div>
          <label className="text-xs font-medium block mb-1">
            Overall Rating: <span className="text-primary font-semibold">{overallRating} / 5</span>
          </label>
          <StarSelector rating={overallRating} setRating={setOverallRating} />
        </div>

        <MSlider label="Knowledge Rating" value={knowledge} setValue={setKnowledge} />
        <MSlider label="Teaching Rating" value={teaching} setValue={setTeaching} />
        <MSlider label="Approachability Rating" value={approachability} setValue={setApproachability} />

        <button className="w-full bg-primary text-white rounded-md py-2 text-sm font-medium hover:bg-primary/90 transition">
          Submit Rating
        </button>

        <p className="text-xs text-center text-muted-foreground font-bold">
          Note: You can submit a rating only once.
        </p>

        <p className="text-xs text-center text-muted-foreground">
          <Link href="#" className="underline">Sign in</Link> to leave a detailed review
        </p>
      </div>
    </div>
  );
};

export default RateThisProfessor;
