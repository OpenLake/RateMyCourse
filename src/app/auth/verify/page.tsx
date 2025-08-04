'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function VerifyAuth() {
  const { user, anonymousId, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect to sign in if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
          <h1 className="mb-6 text-2xl font-bold text-gray-800">Verifying Authentication</h1>
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    // This will typically not be shown due to the redirect
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
          <h1 className="mb-6 text-2xl font-bold text-gray-800">Authentication Required</h1>
          <p className="mb-4 text-lg">You need to be signed in to view this page.</p>
          <Link 
            href="/auth/signin"
            className="inline-block rounded-md bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-2xl font-bold text-gray-800">Authentication Successful</h1>
        
        <div className="mb-6 rounded-md bg-green-50 p-4 text-green-700">
          <p className="font-medium">You are now signed in!</p>
        </div>
        
        <div className="mb-6">
          {/* <h2 className="mb-2 text-lg font-medium text-gray-700">{anonymousId}</h2> */}
          <p className="mb-2 text-sm text-gray-600">
            This is your secure anonymous ID. It cannot be traced back to your email:
          </p>
          <div className="overflow-auto rounded-md bg-gray-100 p-3">
            <code className="text-xs">{anonymousId || 'Loading ID...'}</code>
          </div>
        </div>
        
        <div className="mb-6 rounded-md bg-blue-50 p-4 text-sm text-blue-700">
          <p>
            <strong>Privacy Note:</strong> Your email ({user.email}) is only used for authentication.
            All your ratings and activity use your anonymous ID instead.
          </p>
        </div>
        
        <div className="flex space-x-4">
          <Link 
            href="/dashboard"
            className="flex-1 rounded-md bg-indigo-600 px-4 py-2 text-center text-white hover:bg-indigo-700"
          >
            Go to Dashboard
          </Link>
          <Link 
            href="/"
            className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-center text-gray-700 hover:bg-gray-50"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}