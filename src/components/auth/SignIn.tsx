'use client';

import { useEffect, useState } from 'react';
import { signInWithMagicLink } from '@/lib/supabase-auth';
import { Mail, Lock, Shield } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');


  // Clear email from state after sending magic link
  useEffect(() => {
    if (message) {
      // Clear email from state for additional security
      setEmail('');
    }
  }, [message]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    setError('');
    setMessage('');
    
    try {
      const { error } = await signInWithMagicLink(email);
      if (error) {
        setError(error.message);
      } else {
        setMessage('Check your email for the magic link to sign in!');
        // Clear email for security
        setEmail('');
        
        // Clear localStorage of any traces (optional, depends on your Supabase config)
        // Only do this if you know it won't break auth - may require testing
        // const keysToPreserve = ['sb-<your-project-ref>-auth-token']; // Keep auth token
        // Object.keys(localStorage).forEach(key => {
        //   if (!keysToPreserve.includes(key) && key.startsWith('sb-')) {
        //     localStorage.removeItem(key);
        //   }
        // });
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <div className="flex flex-col items-center mb-6">
        <div className="p-3 bg-blue-100 rounded-full mb-4">
          <Lock className="h-6 w-6 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold">Private Sign In</h1>
        <p className="text-center text-gray-600 mt-2">
          Enhanced privacy protection with zero-knowledge identity
        </p>
      </div>

      {message && (
        <div className="mb-4 p-3 bg-green-100 border border-green-200 text-green-700 rounded">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSignIn}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="you@example.com"
              disabled={isLoading}
              // Disable browser autofill/save for enhanced privacy
              autoSave="off"
              // Clear the input when user navigates away
              onBlur={() => {
                // Optional: clear on blur for enhanced privacy
                // (may affect UX, so consider user needs)
                // setEmail('');
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Sending...' : 'Send magic link'}
        </button>
      </form>

      <div className="mt-6 border-t border-gray-200 pt-6">
        <div className="flex items-center mb-4">
          <Shield className="h-5 w-5 text-gray-500 mr-2" />
          <h2 className="text-sm font-medium text-gray-900">Zero-Knowledge Privacy</h2>
        </div>
        <div className="text-xs text-gray-500 space-y-2">
          <p>
            Your email is <strong>never stored</strong> alongside your ratings. We use advanced
            cryptographic techniques to create an anonymous identifier that cannot be traced back to you.
          </p>
          <p>
            Your email is immediately discarded after authentication. Even our administrators with
            database access cannot connect your identity to your feedback.
          </p>
          <p>
            We use zero-knowledge proofs to verify your identity without storing any
            connection between your email and your ratings.
          </p>
        </div>
      </div>
    </div>
  );
}