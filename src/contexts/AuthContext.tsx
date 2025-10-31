"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  signInWithMagicLink,
  handleAuthCallback,
  getAnonymousId,
} from "../lib/supabase-auth";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
// 👇 **MODIFIED LINE: Import the original shared client**
import { supabase } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  anonymousId: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isReady: boolean;
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
  const [isReady, setIsReady] = useState<boolean>(false);
  const router = useRouter();

  // HIGHLIGHT-START
  useEffect(() => {
    let isMounted = true;

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session);
        if (!isMounted) return;

        let sessionLoaded = false;

        // This event fires on initial page load if a session exists
        if (event === "INITIAL_SESSION" && session?.user) {
          setUser(session.user);
          // On initial load, we can safely get the existing ID
          const { anonymousId, error: idError } = await getAnonymousId();
          if (!idError) setAnonymousId(anonymousId);
          sessionLoaded = true;
        } 
        // This event fires ONLY when a new login happens
        else if (event === "SIGNED_IN" && session?.user) {
          setUser(session.user);
          // DO NOT call getAnonymousId here.
          // The auth/callback page is responsible for creating the ID
          // and will call refreshAnonymousId() itself.
          sessionLoaded = true;
        } 
        else if (event === "SIGNED_OUT") {
          setUser(null);
          setAnonymousId(null);
          sessionLoaded = true;
        }

        // Set ready state only after we've processed an auth event
        if (sessionLoaded || event === "INITIAL_SESSION" /* (even if no user) */) {
          if (isMounted) {
            setIsLoading(false);
            setIsReady(true);
          }
        }
      }
    );

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);
  // HIGHLIGHT-END

  const signIn = async (email: string) => {
    setIsLoading(true);
    const result = await signInWithMagicLink(email);
    setIsLoading(false);
    return result;
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    // This will now use the correct shared client
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setIsLoading(false);
    if (error) {
      console.error("Google sign-in error", error.message);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    // This will now use the correct shared client
    await supabase.auth.signOut();
    setUser(null);
    setAnonymousId(null);
    setIsLoading(false);
    router.push("/");
  };

  const refreshAnonymousId = async () => {
    if (user) {
      const { anonymousId, error } = await getAnonymousId();
      if (!error) setAnonymousId(anonymousId);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        anonymousId,
        isLoading,
        isReady,
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
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};