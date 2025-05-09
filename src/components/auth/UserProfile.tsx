'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { User, LogOut, Shield } from 'lucide-react';
import { getAnonymousId } from '@/lib/supabase-auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export default function UserProfile() {
  const [user, setUser] = useState<any>(null);
  const [anonymousId, setAnonymousId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        // Get authenticated user
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error fetching session:', error);
          setLoading(false);
          return;
        }

        if (session?.user) {
          setUser(session.user);
          
          // Get the user's anonymous ID
          const { anonymousId: anonId, error: anonError } = await getAnonymousId();
          if (!anonError && anonId) {
            setAnonymousId(anonId);
          }
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/signin';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-5 w-5 bg-gray-200 rounded-full animate-pulse"></div>
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-md">
        <User className="h-5 w-5 text-yellow-500 mr-2" />
        <span className="text-sm text-yellow-700">Not signed in</span>
        <a href="/signin" className="ml-3 text-sm font-medium text-blue-600 hover:text-blue-500">
          Sign in
        </a>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-full">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">Signed in as</h3>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
        >
          <LogOut className="h-4 w-4 mr-1" />
          Sign out
        </button>
      </div>
      
      {anonymousId && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center">
            <div className="bg-green-100 p-1 rounded-full mr-2">
              <Shield className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">
                <span className="font-medium text-gray-700">Anonymous ID:</span>{' '}
                <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">{anonymousId.substring(0, 12)}...</code>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Your ratings are completely anonymous and cannot be traced back to your email.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}