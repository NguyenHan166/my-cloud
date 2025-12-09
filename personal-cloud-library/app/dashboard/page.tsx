"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { LibraryView } from "@/components/library-view"
import { AddItemModal } from "@/components/add-item-modal"
import type { Item, Tag } from "@/lib/types"

// Mock data for demonstration
const MOCK_ITEMS: Item[] = [
  {
    id: "1",
    userId: "user1",
    type: "LINK",
    url: "https://github.com/vercel/next.js",
    title: "Next.js GitHub Repository",
    description: "The React Framework for Production",
    domain: "github.com",
    category: "Development",
    project: "Learning",
    importance: "HIGH",
    isPinned: true,
    thumbnail: "/github-nextjs.jpg",
    tagsText: "framework,react,dev",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    userId: "user1",
    type: "NOTE",
    content: "Planning the Q1 roadmap with focus on performance optimization",
    title: "Q1 Roadmap Planning",
    description: "Quarterly planning notes",
    category: "Work",
    project: "Internal",
    importance: "MEDIUM",
    isPinned: true,
    tagsText: "planning,roadmap",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "3",
    userId: "user1",
    type: "FILE",
    originalName: "design-system.pdf",
    title: "Design System Guidelines",
    description: "Complete design system documentation with components and patterns",
    category: "Design",
    project: "Design System",
    importance: "HIGH",
    isPinned: false,
    tagsText: "design,ui,components",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "4",
    userId: "user1",
    type: "LINK",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    title: "Machine Learning Tutorial",
    domain: "youtube.com",
    description: "Comprehensive guide to ML fundamentals",
    category: "Learning",
    project: "AI/ML",
    importance: "MEDIUM",
    isPinned: false,
    thumbnail: "/machine-learning-tutorial.png",
    tagsText: "ml,ai,learning",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "5",
    userId: "user1",
    type: "FILE",
    title: "Annual Report 2024",
    description: "Company financial report and performance metrics",
    category: "Business",
    project: "Company",
    importance: "MEDIUM",
    isPinned: false,
    tagsText: "business,finance,report",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

const MOCK_TAGS: Tag[] = [
  { id: "1", userId: "user1", name: "framework", color: "#3b82f6", createdAt: new Date() },
  { id: "2", userId: "user1", name: "react", color: "#06b6d4", createdAt: new Date() },
  { id: "3", userId: "user1", name: "dev", color: "#8b5cf6", createdAt: new Date() },
  { id: "4", userId: "user1", name: "planning", color: "#f59e0b", createdAt: new Date() },
  { id: "5", userId: "user1", name: "roadmap", color: "#ec4899", createdAt: new Date() },
]

export default function DashboardPage() {
  const router = useRouter()
  const [activeMenu, setActiveMenu] = useState("library")
  const [items, setItems] = useState<Item[]>(MOCK_ITEMS)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userData = localStorage.getItem("currentUser")
    if (!userData) {
      router.push("/login")
      return
    }
    setUser(JSON.parse(userData))
  }, [router])

  const handleAddItem = (newItem: Partial<Item>) => {
    const item: Item = {
      id: Date.now().toString(),
      userId: user?.id || "user1",
      type: newItem.type || "LINK",
      title: newItem.title || "Untitled",
      description: newItem.description,
      url: newItem.url,
      content: newItem.content,
      category: newItem.category || "General",
      importance: newItem.importance || "MEDIUM",
      isPinned: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setItems([item, ...items])
  }

  if (!user) return null

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header userName={`Welcome, ${user.name || user.email}`} userAvatar={user.avatar} />

        <div className="flex-1 overflow-auto">
          {activeMenu === "library" && (
            <div className="p-4 sm:p-6">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">My Library</h1>
                  <p className="text-foreground/60 mt-1">Manage and organize your items</p>
                </div>
                <AddItemModal onAdd={handleAddItem} />
              </div>
              <LibraryView items={items} tags={MOCK_TAGS} />
            </div>
          )}

          {activeMenu === "collections" && (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-muted-foreground">Collections view coming soon</p>
            </div>
          )}

          {activeMenu === "files" && (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-muted-foreground">Files view coming soon</p>
            </div>
          )}

          {activeMenu === "shared" && (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-muted-foreground">Shared links view coming soon</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
