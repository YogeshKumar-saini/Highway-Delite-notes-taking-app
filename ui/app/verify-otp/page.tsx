"use client"

import VerifyOtpForm from "@/components/verify-otp-form"
import { AuthShell } from "@/auth/auth-shell"

export default function VerifyOtpPage() {
  return (
    <AuthShell title="Verify OTP" subtitle="Enter the code we sent to your email or phone.">
      <VerifyOtpForm />
    </AuthShell>
  )
}
