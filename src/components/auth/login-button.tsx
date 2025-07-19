"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { buttonVariants } from "@/components/ui/button";

export function LoginButton() {
  const { isAuthenticated, isReady } = useAuth();

  if (!isReady) {
    return (
      <button
        disabled
        className={buttonVariants({
          size: "lg",
          className: "px-8 py-3 font-medium shadow-md opacity-50",
        })}
      >
        LogIn
      </button>
    );
  }

  return (
    <Link
      href={isAuthenticated ? "/dashboard" : "/auth/signin"}
      className={buttonVariants({
        size: "lg",
        className: "px-8 py-3 font-medium shadow-md",
      })}
    >
      {isAuthenticated ? "Dashboard" : "Log In"}
    </Link>
  );
}
