"use client"

import type React from "react"
import { useState } from "react"
import { api, ApiError } from "@/lib/api"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "react-toastify"

export default function VerifyOtpForm() {
  const router = useRouter()
  const [mode, setMode] = useState<"email" | "phone">("email")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      setLoading(true)
      await api.verifyOtp({
        email: mode === "email" ? email : undefined,
        phone: mode === "phone" ? phone : undefined,
        otp,
      })
      toast.success("✅ OTP verified successfully")
      router.push("/notes")
    } catch (e) {
      const message =
        e instanceof ApiError ? e.payload?.message || e.message : "Failed to verify OTP"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Verify OTP</CardTitle>
        <CardDescription>Enter the code sent to your {mode}.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={mode === "email" ? "default" : "outline"}
              onClick={() => setMode("email")}
            >
              Email
            </Button>
            <Button
              type="button"
              variant={mode === "phone" ? "default" : "outline"}
              onClick={() => setMode("phone")}
            >
              Phone
            </Button>
          </div>

          {mode === "email" ? (
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          ) : (
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                placeholder="+11234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="otp">OTP</Label>
            <Input
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
