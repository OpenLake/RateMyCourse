"use client"

// contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { User, onAuthStateChanged } from 'firebase/auth';
import { getOrCreateAnonymousId, updateLastLogin } from '@/services/auth-service';

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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser && firebaseUser.emailVerified) {
        try {
          // Update last login
          await updateLastLogin(firebaseUser.uid);
          
          // Get or generate anonymous ID
          const anonId = await getOrCreateAnonymousId(firebaseUser);
          setAnonymousId(anonId);
        } catch (error) {
          console.error('Error setting up user:', error);
        }
      } else {
        setAnonymousId(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, anonymousId, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);