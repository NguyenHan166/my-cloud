"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (token) {
      router.push("/dashboard")
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 flex flex-col">
      {/* Header */}
      <header className="border-b border-emerald-200/30 bg-white/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold">
              ☁️
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              CloudHan
            </span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-foreground/60 hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-foreground/60 hover:text-foreground transition-colors">
              Pricing
            </a>
            <a href="#about" className="text-foreground/60 hover:text-foreground transition-colors">
              About
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-6 leading-tight">
            Your Personal Cloud <br />
            <span className="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              Digital Library
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-foreground/60 max-w-2xl mx-auto mb-8">
            Store, organize, and discover your digital knowledge with AI-powered search. All your files, links, and
            notes in one beautiful place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href="/signup">
              <Button
                size="lg"
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white"
              >
                Start Free
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
            <div className="bg-white rounded-xl p-6 border border-border shadow-md hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">📁</div>
              <h3 className="text-xl font-bold text-foreground mb-2">Smart Storage</h3>
              <p className="text-foreground/60">
                Unlimited storage for all your files, links, and notes with intelligent organization.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-border shadow-md hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-foreground mb-2">AI-Powered Search</h3>
              <p className="text-foreground/60">
                Find anything instantly with semantic search powered by advanced AI technology.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 border border-border shadow-md hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">🏷️</div>
              <h3 className="text-xl font-bold text-foreground mb-2">Smart Tags</h3>
              <p className="text-foreground/60">
                Auto-categorize and tag your content with intelligent tagging system.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-white/50 backdrop-blur-md py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-foreground/60 text-sm">
          <p>Made with love by CloudHan. Your knowledge, beautifully organized.</p>
        </div>
      </footer>
    </div>
  )
}
