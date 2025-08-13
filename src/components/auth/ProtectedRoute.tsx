import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireVerification?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  requireVerification = true 
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/auth/signin');
      } else if (requireVerification && !user.email_confirmed_at) {
        router.push('/auth/verify-email');
      }
    }
  }, [user, isLoading, router, requireVerification]);

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  if (requireVerification && !user.email_confirmed_at) {
    return null;
  }

  return <>{children}</>;
}