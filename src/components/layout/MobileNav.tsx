"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, BookOpen, Users, Info, LayoutDashboard, ArrowLeftRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "/courses", label: "Courses", icon: BookOpen },
  { href: "/professors", label: "Professors", icon: Users },
  { href: "/compare", label: "Compare", icon: ArrowLeftRight },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/about", label: "About", icon: Info },
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-md hover:bg-accent transition-colors"
        aria-label="Toggle menu"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 border-b border-border/40 bg-background/95 backdrop-blur-xl shadow-lg z-50"
          >
            <nav className="flex flex-col p-4 gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-accent transition-colors text-sm font-medium"
                >
                  <link.icon className="h-4 w-4 text-primary" />
                  {link.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
