"use client"
import Link from 'next/link';
import { BookOpen, Star, Search, ChevronDown, Sun, Moon, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/theme/mode-toggle';
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
    <header className="px-6 max-w-screen mx-auto sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between">
        
        <div className="flex-shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">RateMyCourse</span>
          </Link>
        </div>

        
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
        </div>

        
        <div className="flex items-center gap-3">
          
          <div className="flex items-center gap-2">
            
            <ModeToggle />
          </div>
          
          
          <Button variant="outline" className="hidden sm:flex items-center gap-2">
            <Star className="h-4 w-4" />
            Star This Repo
          </Button>
          
          
          <Button variant="outline" size="icon" className="sm:hidden">
            <Star className="h-5 w-5" />
            <span className="sr-only">Star This Repo</span>
          </Button>
        </div>
      </div>
    </header>
  );
}