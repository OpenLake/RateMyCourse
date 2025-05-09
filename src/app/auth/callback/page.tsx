'use client';

import EmailVerification from '@/components/auth/EmailVerification';

export default function AuthCallback() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Anonymous Course Rating</h1>
        <p className="mt-2 text-sm text-gray-600">Verifying your sign-in</p>
      </div>
      
      <EmailVerification />
    </div>
  );
}