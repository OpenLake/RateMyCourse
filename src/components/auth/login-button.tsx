"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { buttonVariants } from "@/components/ui/button";
import { LogIn, LayoutDashboard } from "lucide-react";

export function LoginButton() {
  const { isAuthenticated, isReady } = useAuth();

  if (!isReady) {
    return (
      <button
        disabled
        className={buttonVariants({
          size: "sm",
          variant: "outline",
          className:
            "h-9 px-3.5 font-bold text-xs tracking-wider opacity-50 cursor-not-allowed border-border/50 rounded-lg",
        })}
      >
        <span className="font-mono">Loading...</span>
      </button>
    );
  }

  return (
    <Link
      href={isAuthenticated ? "/dashboard" : "/auth/signin"}
      className={buttonVariants({
        size: "sm",
        variant: isAuthenticated ? "default" : "outline",
        className: `h-9 px-3.5 font-bold text-xs tracking-wider hover:scale-[1.02] transition-all duration-300 rounded-lg relative overflow-hidden group ${
          isAuthenticated
            ? "hover:shadow-lg hover:shadow-primary/20"
            : "hover:border-primary/60 hover:bg-primary/10 border-border/50"
        }`,
      })}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-r ${
          isAuthenticated
            ? "from-primary/0 via-primary/20 to-primary/0"
            : "from-transparent via-primary/10 to-transparent"
        } translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500`}
      />

      {isAuthenticated ? (
        <>
          <LayoutDashboard className="h-3.5 w-3.5 mr-1.5 group-hover:scale-110 transition-transform duration-300 relative" />
          <span className="relative font-mono">Dashboard</span>
        </>
      ) : (
        <>
          <LogIn className="h-3.5 w-3.5 mr-1.5 group-hover:translate-x-0.5 transition-transform duration-300 relative" />
          <span className="relative font-mono">Login</span>
        </>
      )}
    </Link>
  );
}
