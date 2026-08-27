"use server"

import { GET, POST, PUT } from "@/lib/api"
import { createLogger } from "@/lib/logger"
import {
  ForgotPasswordSchema,
  ResetPasswordSchema,
  SignInSchema,
  SignUpSchema,
  UpdateProfileSchema,
  VerifyEmailSchema,
} from "@/schemas/auth.schemas"
import type { AuthToken, User } from "@/types"
import { cookies } from "next/headers"

const log = createLogger("auth")

export const signUp = async (payload: SignUpSchema) => {
  log.info(`Sign up user email: ${payload.email}`)
  const resp = await POST<SignUpSchema, null>("/auth/sign-up", payload)
  return resp
}

export const signIn = async (payload: SignInSchema) => {
  log.info(`Sign in user email: ${payload.email}`)
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
    log.info(`Set auth cookie for user email: ${payload.email}`)
  }
  return resp
}

export const verifyEmail = async (payload: VerifyEmailSchema) => {
  log.info(`Verify email for user email: ${payload.email}`)
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
    log.info(`Set auth cookie for user email: ${payload.email}`)
  }
  return resp
}

export const forgotPassword = async (payload: ForgotPasswordSchema) => {
  log.info(`Request password reset for user email: ${payload.email}`)
  const resp = await POST<ForgotPasswordSchema, null>(
    "/auth/forgot-password",
    payload
  )
  return resp
}

export const resetPassword = async (payload: ResetPasswordSchema) => {
  log.info(`Reset password for user email: ${payload.email}`)
  const resp = await POST<ResetPasswordSchema, null>(
    "/auth/reset-password",
    payload
  )
  return resp
}

export const getProfile = async (): Promise<User | null> => {
  log.info("Get profile for current user")
  const resp = await GET<User>("/auth/profile")
  if (resp instanceof Error) {
    return null
  }
  return resp
}

export const updateProfile = async (
  payload: UpdateProfileSchema
): Promise<User | null> => {
  log.info(
    `Update profile firstName: ${payload.firstName} lastName: ${payload.lastName} businessName: ${payload.businessName}`
  )
  const resp = await PUT<UpdateProfileSchema, User>("/auth/update-profile", payload)
  if (resp instanceof Error) {
    return null
  }
  return resp
}

export const deleteAccount = async (): Promise<boolean> => {
  log.info("Delete account for current user")
  const resp = await POST("/auth/delete-account", null)
  if (resp instanceof Error) return false
  const _cookies = await cookies()
  _cookies.delete("AUTH_TOKEN")
  log.info("Cleared auth cookie after account deletion")
  return true
}

export const logout = async () => {
  log.info("Log out current user")
  try {
    await POST("/auth/logout", null)
  } catch (error) {
    log.error("Logout request failed", error)
  }
  const _cookies = await cookies()
  _cookies.delete("AUTH_TOKEN")
  log.info("Cleared auth cookie on logout")
  return true
}
