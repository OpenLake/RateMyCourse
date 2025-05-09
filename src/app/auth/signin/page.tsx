'use client';

import SignIn from '@/components/auth/SignIn';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function SignInPage() {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isLoading, isAuthenticated, router]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-extrabold text-gray-900">Anonymous Course Rating</h1>
        </div>
        <p className="text-center text-lg text-gray-600">
          Share honest feedback without revealing your identity
        </p>
      </div>
      
      <SignIn />
      
      <div className="mt-8 max-w-md text-center text-sm text-gray-500">
        <p>
          By signing in, you agree to our commitment to privacy. Your ratings will never be linked to your identity.
        </p>
      </div>
    </div>
  );
}