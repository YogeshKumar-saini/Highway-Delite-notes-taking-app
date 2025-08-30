import { AuthShell } from "@/auth/auth-shell"
import RegisterForm from "@/components/register-form"

export default function HomePage() {
  return (
    <>
      <AuthShell title="Sign up" subtitle="Sign up to enjoy the feature of HD">
        <RegisterForm />
      </AuthShell>


    </>
  )
}
