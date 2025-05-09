"use client"

import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  anonymousId: string | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  isLoading: true,
  isAuthenticated: false,
  user: null,
  anonymousId: null,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useProvideAuth();
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};

function useProvideAuth() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [anonymousId, setAnonymousId] = useState<string | null>(null);

  useEffect(() => {
    // Get the current session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setUser(session.user);
          setIsAuthenticated(true);
          await fetchAnonymousId(session.user.id);
        }
      } catch (error) {
        console.error('Error checking auth session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch the anonymous ID for the authenticated user
    const fetchAnonymousId = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('anonymous_verification')
          .select('anonymous_id')
          .eq('auth_id', userId)
          .single();
        
        if (error) {
          console.error('Error fetching anonymous ID:', error);
          return;
        }
        
        if (data) {
          setAnonymousId(data.anonymous_id);
        }
      } catch (error) {
        console.error('Unexpected error fetching anonymous ID:', error);
      }
    };

    getInitialSession();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setUser(session.user);
          setIsAuthenticated(true);
          await fetchAnonymousId(session.user.id);
        }
        
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAuthenticated(false);
          setAnonymousId(null);
        }
      }
    );

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign out function
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
      setAnonymousId(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return {
    isLoading,
    isAuthenticated,
    user,
    anonymousId,
    signOut,
  };
}