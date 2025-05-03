import { Star } from 'lucide-react';
import Link from 'next/link';
import React from 'react'


const StarSelector = () => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star key={`star-${i}`} className="w-5 h-5 text-gray-300 hover:text-yellow-400 cursor-pointer transition-colors" />
        ))}
      </div>
    );
  };

const RateThisCourse = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-muted overflow-hidden">
        <div className="p-3 border-b border-muted bg-primary/5">
        <h2 className="font-semibold text-center">Rate This Course</h2>
        </div>
        <div className="p-3">
        <div className="space-y-3">
            <div>
            <label className="text-xs font-medium block mb-1">Your Rating</label>
            <StarSelector />
            </div>
            <div>
            <label className="text-xs font-medium block mb-1">Difficulty</label>
            <select className="w-full text-sm rounded-md border border-muted p-1">
                <option>Select difficulty</option>
                <option>Easy</option>
                <option>Moderate</option>
                <option>Challenging</option>
                <option>Very Difficult</option>
            </select>
            </div>
            <div>
            <label className="text-xs font-medium block mb-1">Semester</label>
            <select className="w-full text-sm rounded-md border border-muted p-1">
                <option>Select semester</option>
                <option>Spring 2025</option>
                <option>Winter 2024</option>
                <option>Fall 2024</option>
            </select>
            </div>
            <button className="w-full bg-primary text-white rounded-md py-2 text-sm font-medium">
            Submit Rating
            </button>
            <p className="text-xs text-center text-muted-foreground">
            <Link href="#" className="underline">Sign in</Link> to leave a detailed review
            </p>
        </div>
        </div>
    </div>
  )
}

export default RateThisCourse
