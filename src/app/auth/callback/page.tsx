'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { handleAuthCallback } from '@/lib/supabase-auth';

export default function AuthCallback() {
  const router = useRouter();
  const [message, setMessage] = useState("Processing login...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processAuth = async () => {
      try {
        // Process the auth callback and create anonymous identity
        const { user, anonymousId, error } = await handleAuthCallback();
        
        if (error) {
          console.error('Auth callback error:', error);
          setMessage('Authentication failed.');
          setError(error.message);
          return;
        }
        
        if (!user || !anonymousId) {
          setMessage('Authentication failed: User data incomplete.');
          setError('Unable to complete authentication process.');
          return;
        }
        
        // Success! Redirect to verification page
        setMessage('Authentication successful! Redirecting...');
        
        // Short timeout to show success message before redirect
        setTimeout(() => {
          router.push('/auth/verify');
        }, 1500);
        
      } catch (err) {
        console.error('Unexpected auth error:', err);
        setMessage('An unexpected error occurred.');
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    processAuth();
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-2xl font-bold text-gray-800">Authentication</h1>
        
        <div className="mb-4 text-lg">A {message}</div>
        
        {error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
            <p>Error: {error}</p>
            <p className="mt-2">
              <button
                onClick={() => router.push('/auth/signin')}
                className="font-medium text-red-700 underline"
              >
                Return to sign in
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}