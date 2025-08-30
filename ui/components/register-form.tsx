"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Box,
  Button,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import { api, ApiError } from "@/lib/api"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider"
import { DatePicker } from "@mui/x-date-pickers/DatePicker"
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns"
import { format } from "date-fns"
import { toast } from "react-toastify"

export default function RegisterForm() {
  const router = useRouter()
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    dateOfBirth: "",
    verificationMethod: "email" as "email" | "phone",
  })
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      setLoading(true)
      const res = await api.register(form)
      toast.success(
        res?.message ||
          `Registered ✅ Check your ${form.verificationMethod} for OTP.`
      )
      setTimeout(() => router.push("/verify-otp"), 1000)
    } catch (e) {
      const message =
        e instanceof ApiError
          ? e.payload?.message || e.message
          : "Failed to register"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      <Box maxWidth={380} width="100%">
        <form onSubmit={onSubmit}>
          <Stack spacing={3}>
            <TextField
              label="Full Name"
              fullWidth
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Date of Birth"
                format="dd MMM yyyy"
                value={form.dateOfBirth ? new Date(form.dateOfBirth) : null}
                onChange={(newValue) =>
                  setForm({
                    ...form,
                    dateOfBirth: newValue
                      ? format(newValue, "yyyy-MM-dd")
                      : "",
                  })
                }
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                  },
                }}
              />
            </LocalizationProvider>

            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <TextField
              label="Phone"
              placeholder="+11234567890"
              fullWidth
              required
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />

            <TextField
              label="Password"
              type="password"
              fullWidth
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />

            <TextField
              select
              label="Verification Method"
              fullWidth
              value={form.verificationMethod}
              onChange={(e) =>
                setForm({
                  ...form,
                  verificationMethod: e.target.value as "email" | "phone",
                })
              }
            >
              <MenuItem value="email">Email</MenuItem>
              <MenuItem value="phone">Phone (SMS)</MenuItem>
            </TextField>

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                bgcolor: "#1976d2",
                fontWeight: "bold",
              }}
            >
              {loading ? "Processing..." : "Get OTP"}
            </Button>

            <Typography variant="body2" align="center" mt={2}>
              Already have an account?{" "}
              <Link href="/login" style={{ color: "#1976d2", fontWeight: 500 }}>
                Sign in
              </Link>
            </Typography>
          </Stack>
        </form>
      </Box>
    </Box>
  )
}
