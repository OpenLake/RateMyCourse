import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';

export default function EmailVerification() {
  const { user, verifyEmail } = useAuth();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Check if email is verified
  useEffect(() => {
    if (user?.emailVerified) {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Send verification email
  const handleResendVerification = async () => {
    try {
      setError('');
      setMessage('');
      setLoading(true);
      await verifyEmail();
      setMessage('Verification email sent! Please check your inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div>You need to sign in first</div>;
  }

  return (
    <div className="max-w-md mx-auto my-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Email Verification</h2>
      
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      {message && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{message}</div>}
      
      <div className="mb-6 text-center">
        <p className="mb-4">
          We&apos;ve sent a verification email to <strong>{user.email}</strong>.
        </p>
        <p className="mb-4">
          Please check your email and click the verification link to activate your account.
        </p>
        <p className="text-sm text-gray-600">
          If you don&apos;t see the email, check your spam folder.
        </p>
      </div>
      
      <button
        onClick={handleResendVerification}
        disabled={loading}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg disabled:bg-blue-300"
      >
        {loading ? 'Sending...' : 'Resend Verification Email'}
      </button>
    </div>
  );
}