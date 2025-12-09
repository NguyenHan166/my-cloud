"use client"

import type { Item, Tag } from "@/lib/types"
import { ITEM_TYPES, IMPORTANCE_LEVELS } from "@/lib/constants"
import { Button } from "@/components/ui/button"

interface ItemCardProps {
  item: Item
  tags?: Tag[]
  onClick?: () => void
  onPin?: (id: string) => void
  onShare?: (id: string) => void
}

export function ItemCard({ item, tags = [], onClick, onPin, onShare }: ItemCardProps) {
  const itemTypeInfo = ITEM_TYPES[item.type] || ITEM_TYPES.FILE
  const importance = IMPORTANCE_LEVELS[item.importance]

  return (
    <div
      onClick={onClick}
      className="group bg-card hover:bg-card/95 border border-border rounded-lg overflow-hidden hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 hover:border-primary/30 cursor-pointer hover:-translate-y-1"
    >
      {/* Header with Type Icon & Actions */}
      <div className="p-3 sm:p-4 pb-2 sm:pb-3 border-b border-border flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
          <span className="text-xl sm:text-2xl flex-shrink-0">{itemTypeInfo.icon}</span>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-card-foreground truncate group-hover:text-primary transition-colors text-sm sm:text-base">
              {item.title}
            </h3>
            {item.domain && <p className="text-xs text-muted-foreground truncate">{item.domain}</p>}
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation()
            onPin?.(item.id)
          }}
          className="flex-shrink-0 p-1"
        >
          {item.isPinned ? "📌" : "📍"}
        </Button>
      </div>

      {/* Content Preview - responsive text sizing */}
      {item.description && (
        <div className="p-3 sm:p-4 pb-2 sm:pb-3">
          <p className="text-xs sm:text-sm text-card-foreground/70 line-clamp-2">{item.description}</p>
        </div>
      )}

      {/* Thumbnail for Links/Videos */}
      {item.thumbnail && (
        <div className="px-3 sm:px-4 pb-2 sm:pb-3">
          <img
            src={item.thumbnail || "/placeholder.svg"}
            alt={item.title}
            className="w-full h-28 sm:h-32 object-cover rounded-lg"
          />
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="px-3 sm:px-4 pb-2 sm:pb-3 flex flex-wrap gap-1.5 sm:gap-2">
          {tags.slice(0, 3).map((tag) => (
            <span
              key={tag.id}
              className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-primary/15 text-primary hover:bg-primary/25 transition-colors"
              style={tag.color ? { backgroundColor: tag.color + "25" } : {}}
            >
              {tag.name}
            </span>
          ))}
          {tags.length > 3 && <span className="text-xs text-muted-foreground">+{tags.length - 3}</span>}
        </div>
      )}

      {/* Footer */}
      <div className="bg-muted/40 px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between border-t border-border gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {item.category && (
            <span className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground font-medium">
              {item.category}
            </span>
          )}
          <span className={`text-xs px-2 py-1 rounded-md font-medium ${importance.color}/20 text-${importance.color}`}>
            {importance.label}
          </span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation()
            onShare?.(item.id)
          }}
          title="Share"
          className="flex-shrink-0 p-1"
        >
          ↗️
        </Button>
      </div>
    </div>
  )
}
