"use server"
import { POST } from "@/lib/api-mail"
import {
  SetupMailAccountProfileSchema,
  SignInSchema,
} from "@/schemas/auth.schemas"
import { cookies } from "next/headers"

export const setupMailAccountProfile = async (
  data: SetupMailAccountProfileSchema
) => {
  return POST<SetupMailAccountProfileSchema, unknown>("/setup-profile", data)
}

export const loginMailAccount = async (data: SignInSchema) => {
  const resp = await POST<SignInSchema, { token: string; expiresAt: string }>(
    "/auth/login",
    data
  )
  if (resp instanceof Error) {
    return resp
  }
  if (resp.token) {
    const _cookies = await cookies()
    _cookies.set("MAIL_AUTH_TOKEN", resp.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(resp.expiresAt),
    })
  }
  return resp
}
