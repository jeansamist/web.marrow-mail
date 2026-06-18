"use client"

import type { MailAccountProfile } from "@/types"
import { createContext, useContext } from "react"

type AuthMailAccountContextValue = {
  profile: MailAccountProfile | null | undefined
}

const AuthMailAccountContext =
  createContext<AuthMailAccountContextValue | null>(null)

export function AuthMailAccountProvider({
  children,
  profile,
}: {
  children: React.ReactNode
  profile: MailAccountProfile | null | undefined
}) {
  return (
    <AuthMailAccountContext.Provider value={{ profile }}>
      {children}
    </AuthMailAccountContext.Provider>
  )
}

export function useAuthMailAccount() {
  const ctx = useContext(AuthMailAccountContext)
  if (!ctx)
    throw new Error(
      "useAuthMailAccount must be used within AuthMailAccountProvider"
    )
  return ctx
}
