"use server"
import { GET, POST } from "@/lib/api-mail"
import {
  SetupMailAccountProfileSchema,
  SignInSchema,
} from "@/schemas/auth.schemas"
import type { Mail, MailAccountProfile, UploadedFile, UploadLink } from "@/types"
import { cookies } from "next/headers"

export const getMailAccountProfile =
  async (): Promise<MailAccountProfile | null> => {
    const resp = await GET<MailAccountProfile>("/auth/profile")
    if (resp instanceof Error) return null
    return resp
  }

export const getReceivedMails = async (): Promise<Mail[]> => {
  const resp = await GET<Mail[]>("/mails/received")
  if (resp instanceof Error) return []
  return resp
}

export const getSentMails = async (): Promise<Mail[]> => {
  const resp = await GET<Mail[]>("/mails/sent")
  if (resp instanceof Error) return []
  return resp
}

export const uploadFiles = async (
  files: { name: string; type: string; size: number; data: Uint8Array }[]
): Promise<(UploadedFile | null)[]> => {
  const links = await POST<
    { files: { originalName: string; mimeType?: string; size?: number }[] },
    UploadLink[]
  >("/storage/upload-links", {
    files: files.map((f) => ({
      originalName: f.name,
      mimeType: f.type || undefined,
      size: f.size,
    })),
  })
  if (links instanceof Error) return files.map(() => null)

  const results = await Promise.allSettled(
    links.map(async ({ uploadUrl, file }, i) => {
      const headers: HeadersInit = {}
      if (file.mimeType) headers["Content-Type"] = file.mimeType
      const res = await fetch(uploadUrl, { method: "PUT", body: Buffer.from(files[i].data), headers })
      if (!res.ok) throw new Error(`S3 PUT failed: ${res.status}`)
      return file
    })
  )

  return results.map((r) => (r.status === "fulfilled" ? r.value : null))
}

export const sendMail = async (payload: {
  to: string[]
  cc?: string[]
  bcc?: string[]
  replyTo?: string
  subject: string
  bodyHtml?: string
  bodyText?: string
}): Promise<Mail | null> => {
  const resp = await POST<typeof payload, Mail>("/mails", payload)
  if (resp instanceof Error) return null
  return resp
}

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
