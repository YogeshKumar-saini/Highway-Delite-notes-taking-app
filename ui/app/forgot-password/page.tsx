"use client"

import type React from "react"

import { useState } from "react"
import { api, ApiError } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    setMsg(null)
    try {
      setLoading(true)
      const res = await api.forgotPassword({ email })
      setMsg(res?.message || "If the email exists, a reset link was sent.")
    } catch (e) {
      const message = e instanceof ApiError ? e.payload?.message || e.message : "Failed to send reset link"
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
            <CardTitle>Forgot Password</CardTitle>
            <CardDescription>We will email you a password reset link.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmit}>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              {err && <p className="text-red-600 text-sm">{err}</p>}
              {msg && <p className="text-emerald-700 text-sm">{msg}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending..." : "Send reset link"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
