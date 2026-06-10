"use server"

import { GET, POST } from "@/lib/api"
import {
  ForgotPasswordSchema,
  ResetPasswordSchema,
  SignInSchema,
  SignUpSchema,
  VerifyEmailSchema,
} from "@/schemas/auth.schemas"
import type { AuthToken, User } from "@/types"
import { cookies } from "next/headers"

export const signUp = async (payload: SignUpSchema) => {
  const resp = await POST<SignUpSchema, null>("/auth/sign-up", payload)
  return resp
}

export const signIn = async (payload: SignInSchema) => {
  const resp = await POST<SignInSchema, AuthToken>("/auth/sign-in", payload)
  if (resp instanceof Error) {
    return resp
  }
  if (resp.token) {
    const _cookies = await cookies()
    _cookies.set("AUTH_TOKEN", resp.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: resp.expiresAt ? new Date(resp.expiresAt) : undefined,
    })
  }
  return resp
}

export const verifyEmail = async (payload: VerifyEmailSchema) => {
  const resp = await POST<VerifyEmailSchema, AuthToken>(
    "/auth/verify-email",
    payload
  )
  if (resp instanceof Error) {
    return resp
  }
  if (resp.token) {
    const _cookies = await cookies()
    _cookies.set("AUTH_TOKEN", resp.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: resp.expiresAt ? new Date(resp.expiresAt) : undefined,
    })
  }
  return resp
}

export const forgotPassword = async (payload: ForgotPasswordSchema) => {
  const resp = await POST<ForgotPasswordSchema, null>(
    "/auth/forgot-password",
    payload
  )
  return resp
}

export const resetPassword = async (payload: ResetPasswordSchema) => {
  const resp = await POST<ResetPasswordSchema, null>(
    "/auth/reset-password",
    payload
  )
  return resp
}

export const getProfile = async (): Promise<User | null> => {
  const resp = await GET<User>("/auth/profile")
  if (resp instanceof Error) {
    return null
  }
  return resp
}

export const logout = async () => {
  try {
    await POST("/auth/logout", null)
  } catch (error) {
    console.error("Logout failed:", error)
  }
  const _cookies = await cookies()
  _cookies.delete("AUTH_TOKEN")
  return true
}
