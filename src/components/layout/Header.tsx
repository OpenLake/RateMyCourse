"use client"
import Link from 'next/link';
import { BookOpen, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/theme/mode-toggle';
import { LoginButton } from '@/components/auth/login-button';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/70 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/50">
      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      
      {/* Subtle top glow effect */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          
          {/* Logo with modern styling */}
          <Link href="/" className="flex items-center gap-2.5 group relative">
            <div className="absolute -inset-2 bg-primary/5 rounded-lg opacity-0 " />
            <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-primary group-hover:rotate-12 transition-transform duration-300 relative z-10" />
            <span className="font-black text-lg sm:text-xl tracking-tight group-hover:text-primary transition-colors duration-300 relative z-10">
              <span className="hidden xs:inline">RateMyCourse</span>
              <span className="xs:hidden font-mono">RateMyCourse</span>
            </span>
          </Link>

          {/* Modern action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Theme Toggle */}
            <ModeToggle />
            
            {/* Login Button */}
            <LoginButton />
            
            {/* Star Repo - Desktop with improved styling */}
            <Button 
              variant="outline" 
              size="sm"
              className="hidden md:flex items-center gap-1.5 relative overflow-hidden group"
              asChild
            >
              <Link href="https://github.com/OpenLake/RateMyCourse" target="_blank" rel="noopener noreferrer">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                <Star className="h-3.5 w-3.5 group-hover:rotate-12 group-hover:fill-primary/20 transition-all duration-300 relative" />
                <span className="relative font-mono">Star</span>
              </Link>
            </Button>
            
            {/* Star Repo - Mobile */}
            <Button 
              variant="outline" 
              size="icon" 
              className="md:hidden relative overflow-hidden group"
              asChild
            >
              <Link href="https://github.com/OpenLake/RateMyCourse" target="_blank" rel="noopener noreferrer">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                <Star className="h-4 w-4 group-hover:rotate-12 group-hover:fill-primary/20 transition-all duration-300 relative" />
                <span className="sr-only">Star This Repo</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}