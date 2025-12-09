"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

interface HeaderProps {
  onSearch?: (query: string) => void
  userName?: string
  userAvatar?: string
}

export function Header({ onSearch, userName = "User", userAvatar }: HeaderProps) {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur-md sticky top-0 z-40">
      <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3 sm:py-4">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 flex-shrink-0 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            ☁️
          </div>
          <span className="hidden sm:inline font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
            CloudHan
          </span>
        </Link>

        {/* Search Bar - improved responsive sizing */}
        <div className="flex-1 max-w-xs sm:max-w-md lg:max-w-2xl">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search by title, tags..."
              onChange={(e) => onSearch?.(e.target.value)}
              className="pr-10 text-sm sm:text-base"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40 text-xs sm:text-sm">⌘K</span>
          </div>
        </div>

        {/* Actions - responsive button layout */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Quick Actions */}
          <div className="hidden sm:flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-xs sm:text-sm bg-transparent">
              📤 Upload
            </Button>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs sm:text-sm">
              ➕ New
            </Button>
          </div>

          {/* Filter & View Toggle */}
          <div className="flex items-center gap-2 border-l border-border pl-2 sm:pl-4">
            <Button variant="ghost" size="sm" title="List view" className="p-1 sm:p-2">
              ☰
            </Button>
            <Button variant="ghost" size="sm" title="Grid view" className="p-1 sm:p-2">
              ⊞
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-1 sm:p-2">
                  ⚙️
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>Sort by Date</DropdownMenuItem>
                <DropdownMenuItem>Sort by Name</DropdownMenuItem>
                <DropdownMenuItem>Sort by Size</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Filter by Type</DropdownMenuItem>
                <DropdownMenuItem>Filter by Category</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full w-8 h-8 sm:w-9 sm:h-9 p-0 border border-border hover:border-primary transition-colors"
              >
                {userAvatar ? (
                  <img
                    src={userAvatar || "/placeholder.svg"}
                    alt={userName}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="font-semibold text-xs sm:text-sm">{userName.charAt(0).toUpperCase()}</span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile">Profile Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Storage Usage</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/login" className="text-destructive">
                  Sign Out
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
