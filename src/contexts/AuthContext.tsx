"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { signInWithMagicLink,handleAuthCallback, getAnonymousId } from "../lib/supabase-auth";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
interface AuthContextType {
  user: User | null;
  anonymousId: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string) => Promise<{ error: any | null }>;
  signInWithGoogle: () => Promise<void>; 
  signOut: () => Promise<void>;
  refreshAnonymousId: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [anonymousId, setAnonymousId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    // Initialize auth state from supabase session
    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          setIsLoading(false);
          return;
        }

        if (session?.user) {
          setUser(session.user);
          // Get anonymous ID if user is logged in
          const { anonymousId, error: idError } = await getAnonymousId();
          if (idError) {
            console.error("Error getting anonymous ID:", idError);
          } else {
            setAnonymousId(anonymousId);
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user);
        // Get anonymous ID when user signs in
        const { anonymousId, error: idError } = await getAnonymousId();
        if (idError) {
          console.error("Error getting anonymous ID:", idError);
        } else {
          setAnonymousId(anonymousId);
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setAnonymousId(null);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email: string) => {
    setIsLoading(true);
    const result = await signInWithMagicLink(email);
    setIsLoading(false);
    return result;
  };
  const signInWithGoogle= async()=>{
    setIsLoading(true);
    const {error}= await supabase.auth.signInWithOAuth({provider:'google', options: {
    redirectTo: `${window.location.origin}/auth/callback`,
  },});
    setIsLoading(false);
    if(error){
      console.error('Google Sign-in Error',error.message);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setAnonymousId(null);
    setIsLoading(false);
    router.push("/");
  };

  const refreshAnonymousId = async () => {
    if (user) {
      const { anonymousId, error } = await getAnonymousId();
      if (error) {
        console.error("Error refreshing anonymous ID:", error);
      } else {
        setAnonymousId(anonymousId);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        anonymousId,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signInWithGoogle,
        signOut,
        refreshAnonymousId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
