"use client"

import type React from "react"

import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { api, ApiError } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function ResetPasswordPage() {
  const params = useParams<{ token: string }>()
  const router = useRouter()
  const token = params.token
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirm] = useState("")
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    setMsg(null)
    if (password.length < 6) {
      setErr("Password must be at least 6 characters.")
      return
    }
    if (password !== confirmPassword) {
      setErr("Passwords do not match.")
      return
    }
    try {
      setLoading(true)
      const res = await api.resetPassword(token, { password, confirmPassword })
      setMsg(res?.message || "Password reset successful.")
      // Backend sendToken logs in user; go to notes
      setTimeout(() => router.push("/notes"), 1000)
    } catch (e) {
      const message = e instanceof ApiError ? e.payload?.message || e.message : "Failed to reset password"
      setErr(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-dvh bg-white">
      <section className="mx-auto max-w-3xl px-4 py-10">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>Enter a new password for your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <Input
                type="password"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
              {err && <p className="text-red-600 text-sm">{err}</p>}
              {msg && <p className="text-emerald-700 text-sm">{msg}</p>}
              <div className="flex items-center gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Update password"}
                </Button>
                <Link href="/login" className="text-sm text-sky-600 hover:underline">
                  Back to login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
