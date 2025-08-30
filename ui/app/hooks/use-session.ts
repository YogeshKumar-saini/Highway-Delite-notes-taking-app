"use client"
import useSWR from "swr"
import { api } from "@/lib/api"

export function useSession() {
  const { data, error, isLoading, mutate } = useSWR("/api/v1/user/me", () => api.me(), {
    shouldRetryOnError: false,
    revalidateOnFocus: false,
  })

  const user = data?.user
  const isAuthenticated = !!user

  return { user, isAuthenticated, isLoading, error, mutate }
}
