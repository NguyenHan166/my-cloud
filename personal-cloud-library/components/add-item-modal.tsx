"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Item, ItemType } from "@/lib/types"

interface AddItemModalProps {
  onAdd?: (item: Partial<Item>) => void
  isOpen?: boolean
}

export function AddItemModal({ onAdd }: AddItemModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [itemType, setItemType] = useState<ItemType>("LINK")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    url: "",
    content: "",
    category: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newItem: Partial<Item> = {
      type: itemType,
      title: formData.title,
      description: formData.description,
      category: formData.category || "General",
      importance: "MEDIUM",
      isPinned: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    if (itemType === "LINK") newItem.url = formData.url
    if (itemType === "NOTE") newItem.content = formData.content

    onAdd?.(newItem)
    setFormData({ title: "", description: "", url: "", content: "", category: "" })
    setIsOpen(false)
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white"
      >
        + New Item
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6 border border-border max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Add New Item</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-foreground/60 hover:text-foreground text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Item Type Selector */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Type</label>
                <div className="flex gap-2">
                  {(["LINK", "NOTE", "FILE"] as ItemType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setItemType(type)}
                      className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors ${
                        itemType === type
                          ? "bg-emerald-500 text-white"
                          : "bg-gray-100 text-foreground hover:bg-gray-200"
                      }`}
                    >
                      {type === "LINK" && "🔗"} {type === "NOTE" && "📝"} {type === "FILE" && "📄"} {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Title *</label>
                <Input
                  type="text"
                  placeholder="Enter title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  className="h-10"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                <Input
                  type="text"
                  placeholder="Brief description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="h-10"
                />
              </div>

              {/* URL for Links */}
              {itemType === "LINK" && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">URL *</label>
                  <Input
                    type="url"
                    placeholder="https://example.com"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    required
                    className="h-10"
                  />
                </div>
              )}

              {/* Content for Notes */}
              {itemType === "NOTE" && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Content *</label>
                  <textarea
                    placeholder="Write your note here..."
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                    className="w-full p-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none h-32"
                  />
                </div>
              )}

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Category</label>
                <Input
                  type="text"
                  placeholder="e.g., Work, Learning, Personal"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="h-10"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white">
                  Add Item
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
