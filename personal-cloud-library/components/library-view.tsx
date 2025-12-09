"use client"

import { useState } from "react"
import type { Item, Tag, FilterOptions } from "@/lib/types"
import { ItemCard } from "@/components/item-card"
import { ItemDetailPanel } from "@/components/item-detail-panel"
import { Button } from "@/components/ui/button"

interface LibraryViewProps {
  items: Item[]
  tags?: Tag[]
  isLoading?: boolean
}

export function LibraryView({ items = [], tags = [], isLoading = false }: LibraryViewProps) {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<"recent" | "name" | "importance">("recent")
  const [filters, setFilters] = useState<FilterOptions>({})

  const sortedItems = [...items].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.title.localeCompare(b.title)
      case "importance":
        const importanceOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 }
        return (
          (importanceOrder[a.importance as keyof typeof importanceOrder] || 2) -
          (importanceOrder[b.importance as keyof typeof importanceOrder] || 2)
        )
      case "recent":
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  const filteredItems = sortedItems.filter((item) => {
    if (filters.type && item.type !== filters.type) return false
    if (filters.category && item.category !== filters.category) return false
    if (filters.project && item.project !== filters.project) return false
    if (filters.importance && item.importance !== filters.importance) return false
    return true
  })

  const pinnedItems = filteredItems.filter((item) => item.isPinned)
  const unpinnedItems = filteredItems.filter((item) => !item.isPinned)

  return (
    <div className="flex-1 overflow-auto flex flex-col">
      <div className="flex-1 overflow-auto">
        <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full">
          {/* Header - improved responsive typography */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-balance">Library</h1>
              <p className="text-sm text-muted-foreground">{filteredItems.length} items found</p>
            </div>
          </div>

          {/* Toolbar - improved responsive layout for mobile */}
          <div className="flex flex-col gap-3 sm:gap-4 mb-6">
            {/* View Mode & Sort */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="flex-1 sm:flex-none text-xs sm:text-sm"
                >
                  ⊞ Grid
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="flex-1 sm:flex-none text-xs sm:text-sm"
                >
                  ☰ List
                </Button>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "recent" | "name" | "importance")}
                className="px-3 py-2 rounded-lg bg-background border border-border text-foreground text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              >
                <option value="recent">Newest first</option>
                <option value="name">A - Z</option>
                <option value="importance">Most Important</option>
              </select>
            </div>

            {/* Quick Filters - improved responsive wrapping */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={!filters.type ? "default" : "outline"}
                size="sm"
                onClick={() => setFilters({ ...filters, type: undefined })}
                className="text-xs sm:text-sm"
              >
                All
              </Button>
              <Button
                variant={filters.type === "FILE" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilters({ ...filters, type: "FILE" })}
                className="text-xs sm:text-sm"
              >
                📁 Files
              </Button>
              <Button
                variant={filters.type === "LINK" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilters({ ...filters, type: "LINK" })}
                className="text-xs sm:text-sm"
              >
                🔗 Links
              </Button>
              <Button
                variant={filters.type === "NOTE" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilters({ ...filters, type: "NOTE" })}
                className="text-xs sm:text-sm"
              >
                📝 Notes
              </Button>
            </div>
          </div>

          {/* Pinned Items */}
          {pinnedItems.length > 0 && (
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xs sm:text-sm font-bold text-muted-foreground uppercase mb-3 sm:mb-4 tracking-wide">
                📌 Pinned ({pinnedItems.length})
              </h2>
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
                    : "space-y-2 sm:space-y-3"
                }
              >
                {pinnedItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    tags={tags.filter((t) => item.tagsText?.includes(t.name))}
                    onClick={() => setSelectedItem(item)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Items */}
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-muted-foreground uppercase mb-3 sm:mb-4 tracking-wide">
              All Items
            </h2>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : unpinnedItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No items found</p>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Create your first item
                </Button>
              </div>
            ) : (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
                    : "space-y-2 sm:space-y-3"
                }
              >
                {unpinnedItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    tags={tags.filter((t) => item.tagsText?.includes(t.name))}
                    onClick={() => setSelectedItem(item)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      <ItemDetailPanel
        item={selectedItem}
        tags={tags.filter((t) => selectedItem?.tagsText?.includes(t.name))}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  )
}
