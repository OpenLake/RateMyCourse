// FILE: components/auth/AuthStatus.tsx
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function AuthStatus() {
  const { user, isLoading, signOut } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
        <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center space-x-3">
        <Link
          href="/auth/signin"
          className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-700">
          {user.email?.split('@')[0]}
        </span>
        <span className="text-xs text-gray-500">Anonymous User</span>
      </div>
      <div className="flex space-x-2">
        <Link
          href="/dashboard"
          className="text-xs text-gray-600 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100"
        >
          Dashboard
        </Link>
        <button
          onClick={() => signOut()}
          className="text-xs text-gray-600 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}