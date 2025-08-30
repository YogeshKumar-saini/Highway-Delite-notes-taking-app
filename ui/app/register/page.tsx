"use client"

import RegisterForm from "@/components/register-form"
import { AuthShell } from "@/auth/auth-shell"

export default function RegisterPage() {
  return (
    <AuthShell title="Sign up" subtitle="Sign up to enjoy the feature of HD">
      <RegisterForm />
    </AuthShell>
  )
}
