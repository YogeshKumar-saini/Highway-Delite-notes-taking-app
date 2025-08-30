"use client"

import LoginForm from "@/components/login-form"
import { AuthShell } from "@/auth/auth-shell"

export default function LoginPage() {
  return (
    <AuthShell title="Sign in" subtitle="Please enter your credentials to continue.">
      <LoginForm />
    </AuthShell>
  )
}
