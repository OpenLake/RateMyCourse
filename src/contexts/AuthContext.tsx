"use client"
// contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

interface AuthContextType {
  user: User | null;
  anonymousId: string | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  anonymousId: null,
  loading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [anonymousId, setAnonymousId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial auth state
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        setUser(session.user);
        
        // You can implement custom logic here for verified emails if needed
        if (session.user.email) {
          try {
            // Update last login or similar functionality can be implemented here
            // const { data, error } = await supabase
            //   .from('user_profiles')
            //   .update({ last_login: new Date() })
            //   .eq('id', session.user.id);
            
            // Get or generate anonymous ID if needed
            // const { data: anonData } = await supabase
            //   .from('anonymous_ids')
            //   .select('anon_id')
            //   .eq('user_id', session.user.id)
            //   .single();
            
            // if (anonData) {
            //   setAnonymousId(anonData.anon_id);
            // }
            
          } catch (error) {
            console.error('Error setting up user:', error);
          }
        }
      } else {
        setUser(null);
        setAnonymousId(null);
      }
      
      setLoading(false);
    };
    
    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user);
        
        // Handle email verification or other auth events
        if (event === 'SIGNED_IN' && session.user.email) {
          // Add any custom logic for verified users
        }
      } else {
        setUser(null);
        setAnonymousId(null);
      }
      
      setLoading(false);
    });

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, anonymousId, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);