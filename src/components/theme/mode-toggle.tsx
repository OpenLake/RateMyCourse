"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ModeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-lg border-border/50 hover:border-primary/60 hover:bg-primary/10 hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0 group-hover:rotate-12 relative" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100 dark:group-hover:-rotate-12" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-[140px] rounded-lg border-border/60 bg-background/95 backdrop-blur-xl"
      >
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="font-medium text-sm cursor-pointer hover:bg-primary/10 transition-colors duration-200 rounded-md"
        >
          <Sun className="h-4 w-4 mr-2" />
          <span className="font-mono text-xs tracking-wide">Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="font-medium text-sm cursor-pointer hover:bg-primary/10 transition-colors duration-200 rounded-md"
        >
          <Moon className="h-4 w-4 mr-2" />
          <span className="font-mono text-xs tracking-wide">Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="font-medium text-sm cursor-pointer hover:bg-primary/10 transition-colors duration-200 rounded-md"
        >
          <Monitor className="h-4 w-4 mr-2" />
          <span className="font-mono text-xs tracking-wide">System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}