'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, User, Shield, LogOut } from 'lucide-react';

export default function Dashboard() {
  const { isLoading, isAuthenticated, user, anonymousId, signOut } = useAuth();
  const router = useRouter();

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/signin');
      alert("User not Authenticated");
    }
  }, [isLoading, isAuthenticated, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };
  
//   if (isLoading || !isAuthenticated) {
//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
//       <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
//       <p className="mt-4 text-gray-600">Checking authentication...</p>
//     </div>
//   );
// }

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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Welcome{user?.email ? `, ${user.email.split('@')[0]}` : ''}!</h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
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
                    Your ratings are completely anonymous and cannot be traced back to your email.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Course Rating Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Rate Courses</h2>
            <p className="text-gray-600 mb-4">
              Share your honest feedback about your courses. Your identity remains anonymous.
            </p>
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
              Start Rating
            </button>
          </div>

          {/* Course Statistics Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Your Ratings</h2>
            <p className="text-gray-600 mb-4">
              You haven't submitted any ratings yet. Start rating courses to see your history here.
            </p>
            <div className="text-center p-6 bg-gray-50 rounded-md">
              <p className="text-gray-500">No ratings found</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}