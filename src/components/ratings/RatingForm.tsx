'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { sanitizeContent, createFuzzyTimestamp } from '@/lib/anonymization';
import { AlertTriangle, Star, Info, Shield } from 'lucide-react';
import Link from 'next/link';

interface RatingFormProps {
  targetId: string;
  targetType: 'course' | 'professor';
  targetName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface RatingMetrics {
  overall: number;
  // Course-specific metrics
  difficulty?: number;
  workload?: number;
  // Professor-specific metrics
  knowledge?: number;
  teaching?: number;
  approachability?: number;
}

interface PIIWarning {
  detected: boolean;
  message: string;
}

const semesters = ['Spring', 'Summer', 'Fall', 'Winter'];
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

export default function RatingForm({ 
  targetId, 
  targetType, 
  targetName,
  onSuccess,
  onCancel 
}: RatingFormProps) {
  const { isAuthenticated, anonymousId } = useAuth();
  const [metrics, setMetrics] = useState<RatingMetrics>({ overall: 0 });
  const [comment, setComment] = useState('');
  const [semester, setSemester] = useState(semesters[0]);
  const [year, setYear] = useState(currentYear);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [piiWarning, setPIIWarning] = useState<PIIWarning>({ detected: false, message: '' });

  // Initialize metrics based on target type
  useEffect(() => {
    if (targetType === 'course') {
      setMetrics({
        overall: 0,
        difficulty: 0,
        workload: 0
      });
    } else {
      setMetrics({
        overall: 0,
        knowledge: 0,
        teaching: 0,
        approachability: 0
      });
    }
  }, [targetType]);

  // Check for potential PII in comment
  useEffect(() => {
    const checkForPII = () => {
      // Simple PII detection patterns - these could be expanded
      const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
      const phonePattern = /(\+\d{1,3}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/;
      const namePattern = /(?:I am|I'm|my name is|this is) ([A-Z][a-z]+ [A-Z][a-z]+)/;
      
      if (emailPattern.test(comment)) {
        setPIIWarning({
          detected: true,
          message: 'Your comment appears to contain an email address. To maintain anonymity, please remove it.'
        });
        return;
      }
      
      if (phonePattern.test(comment)) {
        setPIIWarning({
          detected: true,
          message: 'Your comment appears to contain a phone number. To maintain anonymity, please remove it.'
        });
        return;
      }
      
      if (namePattern.test(comment)) {
        setPIIWarning({
          detected: true,
          message: 'Your comment may contain a name. To maintain anonymity, please avoid including names.'
        });
        return;
      }
      
      setPIIWarning({ detected: false, message: '' });
    };
    
    if (comment.length > 10) {
      checkForPII();
    } else {
      setPIIWarning({ detected: false, message: '' });
    }
  }, [comment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !anonymousId) {
      setError('You must be signed in to submit a rating.');
      return;
    }
    
    // Validate inputs
    if (metrics.overall === 0) {
      setError('Please provide an overall rating.');
      return;
    }
    
    if (targetType === 'course' && (!metrics.difficulty || !metrics.workload)) {
      setError('Please provide ratings for all metrics.');
      return;
    }
    
    if (targetType === 'professor' && 
        (!metrics.knowledge || !metrics.teaching || !metrics.approachability)) {
      setError('Please provide ratings for all metrics.');
      return;
    }
    
    if (piiWarning.detected) {
      setError('Please remove any personal identifying information before submitting.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // Sanitize comment to remove any potential PII
      const sanitizedComment = sanitizeContent(comment);
      
      // Create fuzzy timestamp for display
      const displayDate = createFuzzyTimestamp();
      
      // Insert rating
      const { error: insertError } = await supabase
        .from('ratings')
        .insert({
          anonymous_id: anonymousId,
          target_id: targetId,
          target_type: targetType,
          rating_metrics: metrics,
          comment: sanitizedComment || null,
          semester,
          year,
          display_date: displayDate,
          helpfulness_score: 0,
          is_flagged: false
        });
      
      if (insertError) {
        console.error('Error submitting rating:', insertError);
        setError('Failed to submit rating. Please try again.');
        setIsSubmitting(false);
        return;
      }
      
      // Success
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (err) {
      console.error('Unexpected error submitting rating:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const renderStarRating = (
    metricName: keyof RatingMetrics, 
    label: string,
    description?: string
  ) => {
    return (
      <div className="mb-4">
        <div className="flex items-center mb-1">
          <label htmlFor={metricName} className="block text-sm font-medium text-gray-700">
            {label}
          </label>
          {description && (
            <div className="relative ml-2 group">
              <Info className="h-4 w-4 text-gray-400" />
              <div className="absolute left-full ml-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded p-2 w-56">
                {description}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center" id={metricName}>
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={`${metricName}-${value}`}
              type="button"
              onClick={() => setMetrics({ ...metrics, [metricName]: value })}
              className="p-1 focus:outline-none"
              aria-label={`Rate ${value} out of 5`}
            >
              <Star 
                className={`h-6 w-6 ${
                  (metrics[metricName] || 0) >= value 
                  ? 'text-yellow-400 fill-yellow-400' 
                  : 'text-gray-300'
                }`} 
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-500">
            {metrics[metricName] ? `${metrics[metricName]}/5` : 'Select rating'}
          </span>
        </div>
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-blue-50 p-4 rounded-md mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Info className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Authentication required</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>Please <Link href="/signin" className="font-medium underline">sign in</Link> to submit a rating. Your feedback will remain anonymous.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-md shadow-sm p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Rate {targetName}</h3>
        {onCancel && (
          <button 
            type="button" 
            onClick={onCancel}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Core metrics - differ based on target type */}
        {renderStarRating('overall', 'Overall Rating', 'Your overall impression')}
        
        {targetType === 'course' && (
          <>
            {renderStarRating('difficulty', 'Difficulty', 'How challenging was this course')}
            {renderStarRating('workload', 'Workload', 'Amount of work required')}
          </>
        )}
        
        {targetType === 'professor' && (
          <>
            {renderStarRating('knowledge', 'Knowledge', 'Expertise in the subject matter')}
            {renderStarRating('teaching', 'Teaching Style', 'Effectiveness of teaching methods')}
            {renderStarRating('approachability', 'Approachability', 'Willingness to help students')}
          </>
        )}
        
        {/* Semester & Year Selection */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">
              Semester
            </label>
            <select
              id="semester"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {semesters.map((sem) => (
                <option key={sem} value={sem}>{sem}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
              Year
            </label>
            <select
              id="year"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Comment - with PII warning */}
        <div className="mb-4">
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
            Comments (Optional)
          </label>
          <textarea
            id="comment"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience..."
            className={`block w-full rounded-md border ${
              piiWarning.detected ? 'border-yellow-300' : 'border-gray-300'
            } shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
          />
          
          {piiWarning.detected && (
            <div className="mt-2 flex items-start text-yellow-700 text-sm">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mr-1 flex-shrink-0" />
              <span>{piiWarning.message}</span>
            </div>
          )}
          
          <p className="mt-2 text-xs text-gray-500">
            Do not include identifying information. All comments are automatically reviewed for personal details.
          </p>
        </div>
        
        {/* Privacy notice */}
        <div className="mb-4 p-3 bg-gray-50 rounded-md flex items-start">
          <Shield className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
          <div className="text-xs text-gray-600">
            <p className="font-semibold">Privacy Protection</p>
            <p className="mt-1">
              Your rating is submitted with complete anonymity. Your identity is never linked to your feedback, 
              and even site administrators cannot connect ratings to users.
            </p>
          </div>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || piiWarning.detected}
            className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Rating'}
          </button>
        </div>
      </form>
    </div>
  );
}