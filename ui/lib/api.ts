/* eslint-disable @typescript-eslint/no-explicit-any */
const API_BASE = (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) || "http://localhost:3000"

type ApiOptions = RequestInit & {
  json?: any
  skipJson?: boolean // when response has no JSON
}

export class ApiError extends Error {
  status: number
  payload?: any
  constructor(message: string, status: number, payload?: any) {
    super(message)
    this.status = status
    this.payload = payload
  }
}

export async function apiFetch<T = any>(path: string, options: ApiOptions = {}): Promise<T> {
  const url = `${API_BASE}${path}`
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  }

  let body = options.body

  if (options.json !== undefined) {
    headers["Content-Type"] = "application/json"
    body = JSON.stringify(options.json)
  }

  const res = await fetch(url, {
    ...options,
    headers,
    body,
    credentials: "include",
  })

  const contentType = res.headers.get("content-type") || ""
  const hasJson = contentType.includes("application/json")
  const data = hasJson ? await res.json().catch(() => undefined) : undefined

  if (!res.ok) {
    const message = (data && (data.message || data.error)) || `Request failed with status ${res.status}`
    throw new ApiError(message, res.status, data)
  }

  return (data as T) ?? (undefined as unknown as T)
}

export const api = {
  // User
  register: (payload: {
    name: string
    email: string
    phone: string
    password: string
    dateOfBirth: string
    verificationMethod: "email" | "phone"
  }) => apiFetch("/api/v1/user/register", { method: "POST", json: payload }),

  verifyOtp: (payload: { email?: string; phone?: string; otp: string }) =>
    apiFetch("/api/v1/user/verify-otp", { method: "POST", json: payload }),

  requestLoginOtp: (payload: { email?: string; phone?: string }) =>
    apiFetch("/api/v1/user/login/otp", {
      method: "POST",
      json: { ...payload, loginMethod: "otp" },
    }),

  loginPassword: (payload: { email: string; password: string }) =>
    apiFetch("/api/v1/user/login", {
      method: "POST",
      json: { ...payload, loginMethod: "password" },
    }),

  loginOtp: (payload: { email: string; otp: string }) =>
    apiFetch("/api/v1/user/login", {
      method: "POST",
      json: { ...payload, loginMethod: "otp" },
    }),

  me: () => apiFetch("/api/v1/user/me", { method: "GET" }),

  logout: () => apiFetch("/api/v1/user/logout", { method: "GET" }),

  forgotPassword: (payload: { email: string }) =>
    apiFetch("/api/v1/user/password/forgot", {
      method: "POST",
      json: payload,
    }),

  resetPassword: (token: string, payload: { password: string; confirmPassword: string }) =>
    apiFetch(`/api/v1/user/password/reset/${token}`, {
      method: "PUT",
      json: payload,
    }),

  // Notes
  getNotes: () => apiFetch("/api/v1/user/notes", { method: "GET" }),
  getNote: (id: string) => apiFetch(`/api/v1/user/notes/${id}`, { method: "GET" }),
  createNote: (payload: { title: string; content?: string }) =>
    apiFetch("/api/v1/user/notes", { method: "POST", json: payload }),
  updateNote: (id: string, payload: { title?: string; content?: string }) =>
    apiFetch(`/api/v1/user/notes/${id}`, { method: "PUT", json: payload }),
  deleteNote: (id: string) => apiFetch(`/api/v1/user/notes/${id}`, { method: "DELETE" }),
}
