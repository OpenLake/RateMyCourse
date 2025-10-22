"use client"
import Link from 'next/link';
import { BookOpen, Star, Search, ChevronDown, Sun, Moon, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/theme/mode-toggle';
import { LoginButton } from '@/components/auth/login-button';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from '@/components/ui/input';

export default function Header() {
  const [searchType, setSearchType] = useState('Courses');
  const [searchQuery, setSearchQuery] = useState('');
  
  const themeColors = [
    { name: 'Blue', color: 'bg-blue-500' },
    { name: 'Green', color: 'bg-green-500' },
    { name: 'Purple', color: 'bg-purple-500' },
    { name: 'Orange', color: 'bg-orange-500' },
    { name: 'Red', color: 'bg-red-500' },
  ];

  return (
    <header className="px-6 max-w-screen mx-auto sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      {/* Bottom gradient line */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
      
      <div className="flex h-16 items-center justify-between">
        
        <div className="flex-shrink-0">
          <Link href="/" className="flex items-center gap-2 group">
            <BookOpen className="h-6 w-6 text-primary group-hover:rotate-12 transition-transform duration-300" />
            <span className="font-black text-xl tracking-tight group-hover:text-primary transition-colors duration-300">RateMyCourse</span>
          </Link>
        </div>

{/*         
        <div className="flex-grow max-w-xl mx-4">
          <div className="flex w-full">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-r-none border-r-0 flex gap-1">
                  {searchType}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSearchType('Courses')}>Courses</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSearchType('Professors')}>Professors</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <div className="relative flex-grow">
              <Input
                type="text"
                placeholder={`Search ${searchType.toLowerCase()}...`}
                className="w-full rounded-l-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div> */}

        
        <div className="flex items-center gap-3">
          
          <div className="flex items-center gap-2">
            <ModeToggle />
          </div>
          <div className="flex items-center gap-2">
            <LoginButton />
          </div>
          
          
          <Button 
            variant="outline" 
            className="hidden sm:flex items-center gap-2 font-bold text-sm tracking-wide hover:scale-105 transition-all duration-300 hover:border-primary/50 hover:bg-primary/5 relative overflow-hidden group"
            asChild
          >
            <Link href="https://github.com/OpenLake/RateMyCourse" target="_blank" rel="noopener noreferrer">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <Star className="h-4 w-4 group-hover:rotate-12 transition-transform duration-300 relative" />
              <span className="relative">Star This Repo</span>
            </Link>
          </Button>
          
          
          <Button 
            variant="outline" 
            size="icon" 
            className="sm:hidden hover:scale-105 transition-all duration-300 hover:border-primary/50 hover:bg-primary/5"
            asChild
          >
            <Link href="https://github.com/OpenLake/RateMyCourse" target="_blank" rel="noopener noreferrer">
              <Star className="h-5 w-5 hover:rotate-12 transition-transform duration-300" />
              <span className="sr-only">Star This Repo</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}