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

  useEffect(() => {
    let isMounted = true;

    const getInitialSession = async () => {
      // This will now use the correct shared client
      const { data: { session } } = await supabase.auth.getSession();
      if (!isMounted) return;

      if (session?.user) {
        console.log("✅ Initial session found", session.user);
        setUser(session.user);

        const { anonymousId, error: idError } = await getAnonymousId();
        if (!idError) setAnonymousId(anonymousId);
      } else {
        console.log("❌ No session found");
      }

      setIsLoading(false);
      setIsReady(true);
    };

    getInitialSession();

    // This will now use the correct shared client
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session);
        if (!isMounted) return;

        if (event === "SIGNED_IN" && session?.user) {
          setUser(session.user);
          const { anonymousId, error: idError } = await getAnonymousId();
          if (!idError) setAnonymousId(anonymousId);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setAnonymousId(null);
        }
      }
    );

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

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
