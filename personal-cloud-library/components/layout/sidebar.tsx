"use client"

import { useState } from "react"
import { SIDEBAR_MENU } from "@/lib/constants"
import { cn } from "@/lib/utils"

interface SidebarProps {
  activeMenu?: string
  onMenuChange?: (menuId: string) => void
  tagCounts?: Record<string, number>
}

export function Sidebar({ activeMenu = "library", onMenuChange, tagCounts = {} }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const quickTags = [
    { name: "Work", count: tagCounts["Work"] || 12 },
    { name: "Study", count: tagCounts["Study"] || 8 },
    { name: "Design", count: tagCounts["Design"] || 15 },
    { name: "AI/ML", count: tagCounts["AI/ML"] || 5 },
  ]

  return (
    <aside
      className={cn(
        "border-r border-border bg-sidebar transition-all duration-300 flex flex-col h-screen",
        isCollapsed ? "w-16 sm:w-20" : "w-56 sm:w-64",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-3 sm:p-4 gap-2">
        {!isCollapsed && (
          <h1 className="font-bold text-base sm:text-lg text-sidebar-foreground truncate">
            <span className="text-xl sm:text-2xl">📚</span>
          </h1>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="rounded-lg p-2 hover:bg-sidebar-accent transition-colors flex-shrink-0 text-sm"
          title={isCollapsed ? "Expand" : "Collapse"}
        >
          {isCollapsed ? "→" : "←"}
        </button>
      </div>

      {/* Search Box - improved styling for light theme */}
      {!isCollapsed && (
        <div className="border-b border-border p-3 sm:p-4">
          <input
            type="text"
            placeholder="Search tags..."
            className="w-full rounded-lg bg-background border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
        </div>
      )}

      {/* Menu Items */}
      <nav className="p-3 sm:p-4 flex-shrink-0 space-y-1">
        {SIDEBAR_MENU.map((item) => (
          <button
            key={item.id}
            onClick={() => onMenuChange?.(item.id)}
            className={cn(
              "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
              activeMenu === item.id
                ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/20"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
            )}
            title={isCollapsed ? item.label : undefined}
          >
            <span className="text-lg flex-shrink-0">{item.icon}</span>
            {!isCollapsed && <span className="flex-1 text-left text-sm">{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* Quick Tags Section - display tag counts with improved light theme styling */}
      {!isCollapsed && (
        <div className="border-t border-border p-3 sm:p-4 flex-1 overflow-y-auto">
          <p className="text-xs font-semibold text-sidebar-foreground/60 mb-3 uppercase tracking-wider">Quick Tags</p>
          <div className="space-y-2">
            {quickTags.map((tag) => (
              <button
                key={tag.name}
                className="flex items-center gap-2 text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground transition-all w-full justify-between group px-2 py-2 rounded-lg hover:bg-sidebar-accent/60"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-accent flex-shrink-0 group-hover:scale-125 transition-transform"></span>
                  <span className="text-sm truncate">{tag.name}</span>
                </div>
                <span className="text-xs font-medium bg-primary/20 text-primary px-2 py-1 rounded-full flex-shrink-0 group-hover:bg-primary/30 transition-colors">
                  {tag.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  )
}
