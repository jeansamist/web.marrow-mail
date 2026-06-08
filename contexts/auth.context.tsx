"use client"

import type { User } from "@/types"
import { createContext, useContext } from "react"

type AuthContextValue = {
  user: User | null | undefined
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({
  children,
  user,
}: {
  children: React.ReactNode
  user: User | null | undefined
}) {
  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
