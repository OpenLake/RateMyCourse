'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { User, Shield, LogOut } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function Dashboard() {
  const { isLoading, isAuthenticated, user, anonymousId, signOut } = useAuth();
  const router = useRouter();

  const [userReviews, setUserReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/signin');
      alert('User not Authenticated');
    }
  }, [isLoading, isAuthenticated, router]);

  /* ------------ Fetch REVIEWS (anonymous_id) ------------ */
  useEffect(() => {
    if (!anonymousId) return;

    const fetchUserReviews = async () => {
      setLoadingReviews(true);
      const { data, error } = await supabase
        .from('reviews')
        .select('id, target_id, target_type, comment, created_at, rating_value, difficulty_rating, workload_rating, knowledge_rating, teaching_rating, approachability_rating')
        .eq('anonymous_id', anonymousId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user reviews:', error.message);
      } else {
        setUserReviews(data || []);
      }
      setLoadingReviews(false);
    };

    fetchUserReviews();
  }, [anonymousId]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Course Rating Dashboard</h1>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
          >
            <LogOut className="h-4 w-4 mr-1.5" />
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Profile Card */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Welcome{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
              </h3>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>

          {anonymousId && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center">
                <div className="bg-green-100 p-1.5 rounded-full mr-2">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Anonymous ID:</span>{' '}
                    <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                      {anonymousId.substring(0, 12)}...
                    </code>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Your reviews are stored anonymously.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rate Courses Card */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Rate Courses</h2>
          <p className="text-gray-600 mb-4">
            Share your honest feedback about your courses. Your identity remains anonymous.
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Start Rating
          </Link>
        </div>

        {/* Reviews Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Your Reviews</h2>
          {loadingReviews ? (
            <p className="text-gray-600">Loading your reviews...</p>
          ) : userReviews.length === 0 ? (
            <p className="text-gray-600">You haven't submitted any reviews yet.</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {userReviews.map((review) => (
                <li key={review.id} className="py-3">
                  <p className="text-sm font-medium text-gray-900">
                    {review.target_id} <span className="text-xs text-gray-500">({review.target_type})</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(review.created_at).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">{review.comment || 'No comment provided.'}</p>
                  <p className="text-sm text-gray-700 mt-1">
                    <span className="font-medium text-blue-600">Overall:</span> {review.rating_value ?? 'N/A'}
                    {review.difficulty_rating !== null && review.difficulty_rating !== undefined && (
                      <>
                        {' '}| <span className="font-medium text-red-600">Difficulty:</span> {review.difficulty_rating}
                      </>
                    )}
                    {review.workload_rating !== null && review.workload_rating !== undefined && (
                      <>
                        {' '}| <span className="font-medium text-green-600">Workload:</span> {review.workload_rating}
                      </>
                    )}
                    {review.knowledge_rating !== null && review.knowledge_rating !== undefined && (
                      <>
                        {' '}| <span className="font-medium text-purple-600">Knowledge:</span> {review.knowledge_rating}
                      </>
                    )}
                    {review.teaching_rating !== null && review.teaching_rating !== undefined && (
                      <>
                        {' '}| <span className="font-medium text-indigo-600">Teaching:</span> {review.teaching_rating}
                      </>
                    )}
                    {review.approachability_rating !== null && review.approachability_rating !== undefined && (
                      <>
                        {' '}| <span className="font-medium text-amber-600">Approachability:</span> {review.approachability_rating}
                      </>
                    )}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
