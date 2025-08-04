'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { handleAuthCallback } from '@/lib/supabase-auth';
import { useAuth } from "@/contexts/AuthContext";

export default function AuthCallback() {
  const router = useRouter();
  const { refreshAnonymousId } = useAuth(); // ❌ don't wait for context `isReady` or `user`
  const [message, setMessage] = useState("Processing login...");
  const [error, setError] = useState<string | null>(null);
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    let mounted = true;

    const processAuth = async () => {
      if (!mounted || hasRun) return;
      setHasRun(true);

      try {
        const { user, anonymousId, error } = await handleAuthCallback();

        if (error) {
          if (error.code === '23505') {
            console.warn('User exists. Proceeding.');
          } else if (error.message?.includes('expired') || error.status === 401) {
            setMessage('Session expired. Try signing in again.');
            setError(error.message);
            return;
          } else {
            setMessage('Authentication failed.');
            setError(error.message);
            return;
          }
        }

        if (!user || !anonymousId) {
          setMessage('Missing user or anonymousId.');
          setError('Could not complete authentication.');
          return;
        }

        setMessage('Authentication successful! Redirecting...');
        await refreshAnonymousId();

        window.history.replaceState({}, document.title, window.location.pathname);

        setTimeout(() => {
          router.push('/auth/verify');
        }, 1000);
      } catch (err) {
        setMessage('Unexpected error.');
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    processAuth();

    return () => {
      mounted = false;
    };
  }, [router, refreshAnonymousId, hasRun]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-2xl font-bold text-gray-800">Authentication</h1>
        <div className="mb-4 text-lg">{message}</div>

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
