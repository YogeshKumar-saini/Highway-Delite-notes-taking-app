"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export function Navbar({ showAuthLinks = true }: { showAuthLinks?: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    try {
      setLoading(true)
      await api.logout()
      router.push("/login")
    } catch (e) {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  return (
    <header className="w-full border-b bg-white">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        {/* Brand: navigate to notes (never logs out) */}
        <Link href="/notes" className="flex items-center gap-2 font-semibold text-gray-900" aria-label="Go to Notes">
          <span className="inline-block h-4 w-4 rounded-full bg-blue-600" aria-hidden="true" />
          <span>HD</span>
        </Link>

        {showAuthLinks && (
          <nav className="flex items-center gap-3">
            <Link className="text-sm text-gray-700 hover:text-blue-600" href="/notes" aria-label="Notes dashboard">
              Notes
            </Link>
            <Button variant="outline" onClick={handleLogout} disabled={loading} aria-label="Logout">
              {loading ? "Logging out..." : "Logout"}
            </Button>
          </nav>
        )}
      </div>
    </header>
  )
}
