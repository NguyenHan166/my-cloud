export const ITEM_TYPES: Record<string, { label: string; icon: string }> = {
  FILE: { label: "File", icon: "📄" },
  LINK: { label: "Link", icon: "🔗" },
  NOTE: { label: "Note", icon: "📝" },
}

export const IMPORTANCE_LEVELS: Record<string, { label: string; color: string }> = {
  LOW: { label: "Low", color: "bg-blue-500" },
  MEDIUM: { label: "Medium", color: "bg-yellow-500" },
  HIGH: { label: "High", color: "bg-red-500" },
}

export const STORAGE_CATEGORIES = ["All Files", "Images", "Videos", "Documents", "Other"]

export const SIDEBAR_MENU = [
  { id: "library", label: "Library", icon: "📚" },
  { id: "collections", label: "Collections", icon: "📂" },
  { id: "files", label: "Files", icon: "🖼️" },
  { id: "links", label: "Links", icon: "🔗" },
  { id: "shared", label: "Shared Links", icon: "↗️" },
  { id: "trash", label: "Trash", icon: "🗑️" },
]

export const SHARE_EXPIRATION = [
  { label: "1 Hour", value: 1 },
  { label: "1 Day", value: 24 },
  { label: "7 Days", value: 168 },
  { label: "Never", value: null },
]
