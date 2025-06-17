"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { buttonVariants } from "@/components/ui/button";

export function LoginButton() {
  const{isAuthenticated}= useAuth();
  return (
    <Link
      href={isAuthenticated?"/dashboard":"/auth/signin"}
      className={buttonVariants({
        size: "lg",
        className: "px-8 py-3 font-medium shadow-md",
      })}
    >
      {isAuthenticated?"DashBoard":"Log In"}
    </Link>
  );
}
