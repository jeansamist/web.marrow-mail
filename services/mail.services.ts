"use server"
import { DELETE, GET, POST, PUT } from "@/lib/api-mail"
import {
  ChangeMailAccountPasswordSchema,
  DisableTwoFactorSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  SetForwardingEmailSchema,
  SetupMailAccountProfileSchema,
  SignInSchema,
  TwoFactorCodeSchema,
  UpdateForwardingPreferencesSchema,
  UpdateMailAccountProfileSchema,
} from "@/schemas/auth.schemas"
import type {
  DraftMailSchema,
  ForwardMailSchema,
  MarkImportantSchema,
  MarkSpamSchema,
  MoveMailToFolderSchema,
  RescheduleMailSchema,
  ScheduleMailSchema,
} from "@/schemas/mail.schemas"
import type {
  Mail,
  MailAccountProfile,
  TwoFactorSetup,
  UploadedFile,
  UploadLink,
} from "@/types"
import { cookies } from "next/headers"

export const getMailAccountProfile =
  async (): Promise<MailAccountProfile | null> => {
    const resp = await GET<MailAccountProfile>("/auth/profile")
    if (resp instanceof Error) return null
    return resp
  }

export const updateMailAccountProfile = async (
  data: UpdateMailAccountProfileSchema
): Promise<MailAccountProfile | null> => {
  const resp = await PUT<UpdateMailAccountProfileSchema, MailAccountProfile>("/profile", data)
  if (resp instanceof Error) return null
  return resp
}

export const changeMailAccountPassword = async (
  data: ChangeMailAccountPasswordSchema
): Promise<boolean> => {
  const resp = await PUT<ChangeMailAccountPasswordSchema, null>("/auth/change-password", data)
  return !(resp instanceof Error)
}

export const setupTwoFactor = async (): Promise<TwoFactorSetup | null> => {
  const resp = await POST<undefined, TwoFactorSetup>("/auth/2fa/setup", undefined)
  if (resp instanceof Error) return null
  return resp
}

export const setupTwoFactorWithQr = async (): Promise<
  (TwoFactorSetup & { qrDataUrl: string }) | null
> => {
  const setup = await setupTwoFactor()
  if (!setup) return null
  const QRCode = (await import("qrcode")).default
  const qrDataUrl = await QRCode.toDataURL(setup.otpauthUrl)
  return { ...setup, qrDataUrl }
}

export const enableTwoFactor = async (data: TwoFactorCodeSchema): Promise<boolean> => {
  const resp = await POST<TwoFactorCodeSchema, null>("/auth/2fa/enable", data)
  return !(resp instanceof Error)
}

export const disableTwoFactor = async (data: DisableTwoFactorSchema): Promise<boolean> => {
  const resp = await POST<DisableTwoFactorSchema, null>("/auth/2fa/disable", data)
  return !(resp instanceof Error)
}

export const setForwardingEmail = async (data: SetForwardingEmailSchema): Promise<boolean> => {
  const resp = await PUT<SetForwardingEmailSchema, null>("/forwarding", data)
  return !(resp instanceof Error)
}

export const verifyForwardingEmail = async (token: string): Promise<boolean> => {
  const resp = await POST<{ token: string }, null>("/forwarding/verify", { token })
  return !(resp instanceof Error)
}

export const updateForwardingPreferences = async (
  data: UpdateForwardingPreferencesSchema
): Promise<boolean> => {
  const resp = await PUT<UpdateForwardingPreferencesSchema, null>("/forwarding/preferences", data)
  return !(resp instanceof Error)
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

export const getFiles = async (): Promise<UploadedFile[]> => {
  const resp = await GET<UploadedFile[]>("/storage/files")
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
  attachmentIds?: number[]
}): Promise<Mail | null> => {
  const resp = await POST<typeof payload, Mail>("/mails", payload)
  if (resp instanceof Error) return null
  return resp
}

export const getDrafts = async (): Promise<Mail[]> => {
  const resp = await GET<Mail[]>("/mails/drafts")
  if (resp instanceof Error) return []
  return resp
}

export const saveDraft = async (payload: DraftMailSchema): Promise<Mail | null> => {
  const resp = await POST<DraftMailSchema, Mail>("/mails/drafts", payload)
  if (resp instanceof Error) return null
  return resp
}

export const updateDraft = async (
  id: number,
  payload: DraftMailSchema
): Promise<Mail | null> => {
  const resp = await PUT<DraftMailSchema, Mail>(`/mails/drafts/${id}`, payload)
  if (resp instanceof Error) return null
  return resp
}

export const deleteDraft = async (id: number): Promise<boolean> => {
  const resp = await DELETE(`/mails/drafts/${id}`)
  return !(resp instanceof Error)
}

export const sendDraft = async (id: number): Promise<Mail | null> => {
  const resp = await POST<null, Mail>(`/mails/drafts/${id}/send`, null)
  if (resp instanceof Error) return null
  return resp
}

export const moveMailToFolder = async (
  id: number,
  payload: MoveMailToFolderSchema
): Promise<Mail | null> => {
  const resp = await PUT<MoveMailToFolderSchema, Mail>(`/mails/${id}/folder`, payload)
  if (resp instanceof Error) return null
  return resp
}

export const markMailSpam = async (
  id: number,
  payload: MarkSpamSchema
): Promise<Mail | null> => {
  const resp = await PUT<MarkSpamSchema, Mail>(`/mails/${id}/spam`, payload)
  if (resp instanceof Error) return null
  return resp
}

export const markMailImportant = async (
  id: number,
  payload: MarkImportantSchema
): Promise<Mail | null> => {
  const resp = await PUT<MarkImportantSchema, Mail>(`/mails/${id}/star`, payload)
  if (resp instanceof Error) return null
  return resp
}

export const markMailRead = async (id: number, isRead: boolean): Promise<Mail | null> => {
  const resp = await PUT<{ isRead: boolean }, Mail>(`/mails/${id}/read`, { isRead })
  if (resp instanceof Error) return null
  return resp
}

export const getTrashMails = async (): Promise<Mail[]> => {
  const resp = await GET<Mail[]>("/mails/trash")
  if (resp instanceof Error) return []
  return resp
}

export const getSpamMails = async (): Promise<Mail[]> => {
  const resp = await GET<Mail[]>("/mails/spam")
  if (resp instanceof Error) return []
  return resp
}

export const trashMail = async (id: number): Promise<Mail | null> => {
  const resp = await PUT<undefined, Mail>(`/mails/${id}/trash`, undefined)
  if (resp instanceof Error) return null
  return resp
}

export const restoreMail = async (id: number): Promise<Mail | null> => {
  const resp = await PUT<undefined, Mail>(`/mails/${id}/restore`, undefined)
  if (resp instanceof Error) return null
  return resp
}

export const permanentlyDeleteMail = async (id: number): Promise<boolean> => {
  const resp = await DELETE(`/mails/${id}`)
  return !(resp instanceof Error)
}

export const forwardMail = async (
  id: number,
  payload: ForwardMailSchema
): Promise<Mail | null> => {
  const resp = await POST<ForwardMailSchema, Mail>(`/mails/${id}/forward`, payload)
  if (resp instanceof Error) return null
  return resp
}

export const getScheduledMails = async (): Promise<Mail[]> => {
  const resp = await GET<Mail[]>("/mails/scheduled")
  if (resp instanceof Error) return []
  return resp
}

export const scheduleMail = async (payload: ScheduleMailSchema): Promise<Mail | null> => {
  const resp = await POST<ScheduleMailSchema, Mail>("/mails/schedule", payload)
  if (resp instanceof Error) return null
  return resp
}

export const rescheduleMail = async (
  id: number,
  payload: RescheduleMailSchema
): Promise<Mail | null> => {
  const resp = await PUT<RescheduleMailSchema, Mail>(`/mails/${id}/schedule`, payload)
  if (resp instanceof Error) return null
  return resp
}

export const cancelScheduledMail = async (id: number): Promise<Mail | null> => {
  const resp = await DELETE<Mail>(`/mails/${id}/schedule`)
  if (resp instanceof Error) return null
  return resp
}

export const setupMailAccountProfile = async (
  data: SetupMailAccountProfileSchema
): Promise<MailAccountProfile | Error> => {
  return POST<SetupMailAccountProfileSchema, MailAccountProfile>("/setup-profile", data)
}

type MailLoginResponse =
  | { requiresTwoFactor: false; token: string; expiresAt: string }
  | { requiresTwoFactor: true; challengeToken: string; expiresAt: string }

export const forgotMailAccountPassword = async (payload: ForgotPasswordSchema) => {
  const resp = await POST<ForgotPasswordSchema, null>("/auth/forgot-password", payload)
  return resp
}

export const resetMailAccountPassword = async (payload: ResetPasswordSchema) => {
  const resp = await POST<ResetPasswordSchema, null>("/auth/reset-password", payload)
  return resp
}

export const loginMailAccount = async (data: SignInSchema) => {
  const resp = await POST<SignInSchema, MailLoginResponse>("/auth/login", data)
  if (resp instanceof Error) {
    return resp
  }
  if (!resp.requiresTwoFactor) {
    await setMailAuthCookie(resp.token, resp.expiresAt)
  }
  return resp
}

export const verifyMailAccountTwoFactor = async (challengeToken: string, code: string) => {
  const resp = await POST<
    { challengeToken: string; code: string },
    { token: string; expiresAt: string }
  >("/auth/verify-2fa", { challengeToken, code })
  if (resp instanceof Error) {
    return resp
  }
  await setMailAuthCookie(resp.token, resp.expiresAt)
  return resp
}

async function setMailAuthCookie(token: string, expiresAt: string) {
  const _cookies = await cookies()
  _cookies.set("MAIL_AUTH_TOKEN", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(expiresAt),
  })
}

// Mail-account auth is a stateless JWT (no server-side session to revoke) —
// logging out just clears the cookie, there's no backend call to make.
export const logoutMailAccount = async () => {
  const _cookies = await cookies()
  _cookies.delete("MAIL_AUTH_TOKEN")
  return true
}
