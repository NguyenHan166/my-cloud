"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import type { User } from "@/lib/types"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({ name: "", email: "" })

  useEffect(() => {
    const userData = localStorage.getItem("currentUser")
    if (!userData) {
      router.push("/login")
      return
    }
    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    setFormData({ name: parsedUser.name || "", email: parsedUser.email })
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("currentUser")
    router.push("/login")
  }

  const handleSaveProfile = () => {
    if (user) {
      const updatedUser = { ...user, ...formData }
      localStorage.setItem("currentUser", JSON.stringify(updatedUser))
      setUser(updatedUser)
      setIsEditing(false)
    }
  }

  if (!user) return null

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeMenu="profile" onMenuChange={() => {}} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header userName={user.name || user.email} userAvatar={user.avatar} />

        <div className="flex-1 overflow-auto">
          <div className="max-w-2xl mx-auto p-6 sm:p-8">
            {/* Profile Header */}
            <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 border border-border mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6">
                {user.avatar && (
                  <img
                    src={user.avatar || "/placeholder.svg"}
                    alt={user.name}
                    className="w-20 h-20 rounded-full border-2 border-emerald-500"
                  />
                )}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-foreground mb-1">{user.name}</h1>
                  <p className="text-foreground/60">{user.email}</p>
                </div>
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  {isEditing ? "Cancel" : "Edit Profile"}
                </Button>
              </div>

              {/* Edit Form */}
              {isEditing && (
                <div className="border-t border-border pt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="h-10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="h-10"
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSaveProfile} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                      Save Changes
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Account Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-gradient-to-br from-emerald-50 to-cyan-50 rounded-xl p-6 border border-border">
                <p className="text-sm font-medium text-foreground/60 mb-1">Total Items</p>
                <p className="text-3xl font-bold text-emerald-600">24</p>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-emerald-50 rounded-xl p-6 border border-border">
                <p className="text-sm font-medium text-foreground/60 mb-1">Storage Used</p>
                <p className="text-3xl font-bold text-blue-600">2.4 GB</p>
              </div>
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-6 border border-border">
                <p className="text-sm font-medium text-foreground/60 mb-1">Member Since</p>
                <p className="text-sm text-foreground/80">{new Date().toLocaleDateString()}</p>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-red-50 rounded-xl p-6 border border-red-200">
              <h2 className="text-lg font-bold text-red-900 mb-2">Danger Zone</h2>
              <p className="text-red-800 text-sm mb-4">
                Once you log out, you'll need to sign in again to access your library.
              </p>
              <Button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
