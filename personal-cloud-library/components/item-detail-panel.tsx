"use client"

import { useState } from "react"
import type { Item, Tag } from "@/lib/types"
import { ITEM_TYPES, IMPORTANCE_LEVELS } from "@/lib/constants"
import { Button } from "@/components/ui/button"

interface ItemDetailPanelProps {
  item: Item | null
  tags?: Tag[]
  isOpen: boolean
  onClose: () => void
}

export function ItemDetailPanel({ item, tags = [], isOpen, onClose }: ItemDetailPanelProps) {
  const [showShareModal, setShowShareModal] = useState(false)

  if (!isOpen || !item) return null

  const itemTypeInfo = ITEM_TYPES[item.type]

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-96 bg-background border-l border-border shadow-lg z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 border-b border-border bg-background p-4 flex items-center justify-between">
          <h2 className="font-bold text-lg">Item Details</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Preview */}
          {item.thumbnail && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Preview</label>
              <img
                src={item.thumbnail || "/placeholder.svg"}
                alt={item.title}
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Title</label>
            <p className="text-lg font-bold text-foreground">{item.title}</p>
          </div>

          {/* Type */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Type</label>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{itemTypeInfo?.icon}</span>
              <span className="text-sm">{item.type}</span>
            </div>
          </div>

          {/* URL/Content */}
          {item.url && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase">URL</label>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline break-all"
              >
                {item.url}
              </a>
            </div>
          )}

          {item.content && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Content</label>
              <p className="text-sm text-foreground/70 whitespace-pre-wrap">{item.content}</p>
            </div>
          )}

          {/* Description */}
          {item.description && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Description</label>
              <p className="text-sm text-foreground/70">{item.description}</p>
            </div>
          )}

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Tags</label>
            <div className="flex flex-wrap gap-2">
              {tags.length > 0 ? (
                tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-accent/20 text-accent"
                  >
                    {tag.name}
                  </span>
                ))
              ) : (
                <span className="text-sm text-muted-foreground">No tags</span>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4">
            {item.category && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Category</label>
                <p className="text-sm">{item.category}</p>
              </div>
            )}
            {item.project && (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Project</label>
                <p className="text-sm">{item.project}</p>
              </div>
            )}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Importance</label>
              <p className="text-sm">{IMPORTANCE_LEVELS[item.importance].label}</p>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Created</label>
              <p className="text-sm">{new Date(item.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* AI Actions */}
          <div className="space-y-2 pt-2 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase">AI Actions</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                ✨ Generate Tags
              </Button>
              <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                📝 Summarize
              </Button>
            </div>
          </div>

          {/* Share */}
          <div className="space-y-2 pt-2 border-t border-border">
            <Button onClick={() => setShowShareModal(true)} variant="default" className="w-full">
              🔗 Create Share Link
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
