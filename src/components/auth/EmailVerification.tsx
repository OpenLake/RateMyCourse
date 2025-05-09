'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { handleAuthCallback } from '@/lib/supabase-auth';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function EmailVerification() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const verifySession = async () => {
      try {
        const { user, anonymousId, error } = await handleAuthCallback();
        
        if (error || !user || !anonymousId) {
          console.error('Verification error:', error);
          setStatus('error');
          setErrorMessage(error?.message || 'Failed to verify your identity.');
          return;
        }
        
        // Successfully verified and created anonymous identity
        setStatus('success');
        
        // Redirect after short delay to allow user to see success message
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
        
      } catch (err) {
        console.error('Unexpected error during verification:', err);
        setStatus('error');
        setErrorMessage('An unexpected error occurred. Please try signing in again.');
      }
    };

    verifySession();
  }, [router]);

  return (
    <div className="max-w-md w-full mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <div className="flex flex-col items-center justify-center py-6">
        {status === 'loading' && (
          <>
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
            <h2 className="text-xl font-semibold text-gray-900">Verifying your identity</h2>
            <p className="mt-2 text-sm text-gray-600 text-center">
              Please wait while we securely verify your identity and create your anonymous profile...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900">Verification successful!</h2>
            <p className="mt-2 text-sm text-gray-600 text-center">
              Your anonymous identity has been created. Redirecting you to the dashboard...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900">Verification failed</h2>
            <p className="mt-2 text-sm text-gray-600 text-center">
              {errorMessage || 'There was a problem verifying your identity.'}
            </p>
            <button
              onClick={() => router.push('/signin')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Try again
            </button>
          </>
        )}
      </div>

      <div className="mt-6 border-t border-gray-200 pt-4">
        <p className="text-xs text-gray-500 text-center">
          Your email is never stored alongside your ratings. We use advanced cryptography to ensure
          your feedback remains completely anonymous.
        </p>
      </div>
    </div>
  );
}