"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import { api, ApiError } from "@/lib/api"

export default function LoginForm() {
  const router = useRouter()
  const [mode, setMode] = useState<"password" | "otp">("password")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState("")
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function sendOtp() {
    setErr(null)
    setMsg(null)
    try {
      setLoading(true)
      await api.requestLoginOtp({ email })
      setOtpSent(true)
      setMsg("OTP sent to your email.")
    } catch (e) {
      const message =
        e instanceof ApiError ? e.payload?.message || e.message : "Failed to send OTP"
      setErr(message)
    } finally {
      setLoading(false)
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErr(null)
    setMsg(null)

    try {
      setLoading(true)
      if (mode === "password") {
        await api.loginPassword({ email, password })
      } else {
        await api.loginOtp({ email, otp })
      }
      router.push("/notes")
    } catch (e) {
      const message =
        e instanceof ApiError ? e.payload?.message || e.message : "Login failed"
      setErr(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      minHeight="auto"
    >
      <Box maxWidth={400} width="100%">
        {/* Mode toggle */}
        <Stack direction="row" spacing={2} mb={3}>
          <Button
            variant={mode === "password" ? "contained" : "outlined"}
            onClick={() => {
              setMode("password")
              setOtpSent(false)
              setOtp("")
            }}
            fullWidth
            sx={{ textTransform: "none", borderRadius: "8px" }}
          >
            Password
          </Button>
          <Button
            variant={mode === "otp" ? "contained" : "outlined"}
            onClick={() => {
              setMode("otp")
              setOtpSent(false)
              setOtp("")
            }}
            fullWidth
            sx={{ textTransform: "none", borderRadius: "8px" }}
          >
            OTP
          </Button>
        </Stack>

        {/* Form */}
        <form onSubmit={onSubmit}>
          <Stack spacing={3}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {mode === "password" ? (
              <TextField
                label="Password"
                type="password"
                fullWidth
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            ) : (
              <>
                {!otpSent ? (
                  <Button
                    type="button"
                    onClick={sendOtp}
                    disabled={loading || !email}
                    fullWidth
                    sx={{
                      borderRadius: "8px",
                      textTransform: "none",
                      bgcolor: "#1976d2",
                      color: "#fff",
                      "&:hover": { bgcolor: "#155bb5" },
                    }}
                  >
                    {loading ? "Sending..." : "Send OTP"}
                  </Button>
                ) : (
                  <TextField
                    label="Enter OTP"
                    fullWidth
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                  />
                )}
              </>
            )}

            {/* Error / Success */}
            {err && <Typography color="error" fontSize="0.9rem">{err}</Typography>}
            {msg && <Typography color="green" fontSize="0.9rem">{msg}</Typography>}

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading || (mode === "otp" && otpSent && otp.length === 0)}
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                bgcolor: "#1976d2",
                fontWeight: "bold",
              }}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>

            {/* Footer links */}
            <Stack direction="row" justifyContent="space-between" mt={1}>
              <Link href="/forgot-password" style={{ color: "#1976d2", fontSize: "0.9rem" }}>
                Forgot password?
              </Link>
              <Link href="/register" style={{ color: "#1976d2", fontSize: "0.9rem" }}>
                Create account
              </Link>
            </Stack>
          </Stack>
        </form>
      </Box>
    </Box>
  )
}
