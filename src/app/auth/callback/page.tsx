// app/auth/callback/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Check, AlertCircle } from 'lucide-react';

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your identity and creating anonymous profile...');
  const router = useRouter();

  useEffect(() => {
    const processAuthCallback = async () => {
      try {
        // Call the server-side anonymization endpoint
        // This ensures email processing stays server-side only
        const response = await fetch('/api/auth/anonymize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Include cookies for auth
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to process authentication');
        }

        // Successfully created anonymous identity
        setStatus('success');
        setMessage('Anonymous identity created successfully!');
        
        // Redirect to dashboard after brief delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 500);
        
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage('Authentication failed. Please try again.');
        
        // Redirect to sign-in after delay
        setTimeout(() => {
          router.push('/auth/signin');
        }, 500);
      }
    };

    processAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col items-center">
          {status === 'loading' && (
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          )}
          
          {status === 'success' && (
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
          )}
          
          {status === 'error' && (
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          )}
          
          <h1 className="text-xl font-bold mb-2">
            {status === 'loading' && 'Securing Your Identity'}
            {status === 'success' && 'Identity Secured'}
            {status === 'error' && 'Authentication Failed'}
          </h1>
          
          <p className="text-center text-gray-600">{message}</p>
          
          {status === 'success' && (
            <div className="mt-4 flex items-center text-sm text-green-600">
              <Shield className="h-4 w-4 mr-1" />
              <span>Your privacy is protected</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}