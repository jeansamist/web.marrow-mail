"use server"
import { DELETE, GET, POST, PUT } from "@/lib/api-mail"
import { createLogger } from "@/lib/logger"
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

const log = createLogger("mail")

export const getMailAccountProfile =
  async (): Promise<MailAccountProfile | null> => {
    log.info("Get mail account profile")
    const resp = await GET<MailAccountProfile>("/auth/profile")
    if (resp instanceof Error) return null
    return resp
  }

export const updateMailAccountProfile = async (
  data: UpdateMailAccountProfileSchema
): Promise<MailAccountProfile | null> => {
  log.info("Update mail account profile")
  const resp = await PUT<UpdateMailAccountProfileSchema, MailAccountProfile>("/profile", data)
  if (resp instanceof Error) return null
  return resp
}

export const changeMailAccountPassword = async (
  data: ChangeMailAccountPasswordSchema
): Promise<boolean> => {
  log.info("Change mail account password")
  const resp = await PUT<ChangeMailAccountPasswordSchema, null>("/auth/change-password", data)
  return !(resp instanceof Error)
}

export const setupTwoFactor = async (): Promise<TwoFactorSetup | null> => {
  log.info("Setup two-factor")
  const resp = await POST<undefined, TwoFactorSetup>("/auth/2fa/setup", undefined)
  if (resp instanceof Error) return null
  return resp
}

export const setupTwoFactorWithQr = async (): Promise<
  (TwoFactorSetup & { qrDataUrl: string }) | null
> => {
  log.info("Setup two-factor with QR")
  const setup = await setupTwoFactor()
  if (!setup) return null
  log.info("Generate two-factor QR code")
  const QRCode = (await import("qrcode")).default
  const qrDataUrl = await QRCode.toDataURL(setup.otpauthUrl)
  return { ...setup, qrDataUrl }
}

export const enableTwoFactor = async (data: TwoFactorCodeSchema): Promise<boolean> => {
  log.info("Enable two-factor")
  const resp = await POST<TwoFactorCodeSchema, null>("/auth/2fa/enable", data)
  return !(resp instanceof Error)
}

export const disableTwoFactor = async (data: DisableTwoFactorSchema): Promise<boolean> => {
  log.info("Disable two-factor")
  const resp = await POST<DisableTwoFactorSchema, null>("/auth/2fa/disable", data)
  return !(resp instanceof Error)
}

export const setForwardingEmail = async (data: SetForwardingEmailSchema): Promise<boolean> => {
  log.info(`Set forwarding email: ${data.forwardingEmail}`)
  const resp = await PUT<SetForwardingEmailSchema, null>("/forwarding", data)
  return !(resp instanceof Error)
}

export const verifyForwardingEmail = async (token: string): Promise<boolean> => {
  log.info("Verify forwarding email")
  const resp = await POST<{ token: string }, null>("/forwarding/verify", { token })
  return !(resp instanceof Error)
}

export const updateForwardingPreferences = async (
  data: UpdateForwardingPreferencesSchema
): Promise<boolean> => {
  log.info(`Update forwarding preferences keepForwardedCopy: ${data.keepForwardedCopy}`)
  const resp = await PUT<UpdateForwardingPreferencesSchema, null>("/forwarding/preferences", data)
  return !(resp instanceof Error)
}

export const getReceivedMails = async (): Promise<Mail[]> => {
  log.info("Get received mails")
  const resp = await GET<Mail[]>("/mails/received")
  if (resp instanceof Error) return []
  return resp
}

export const getSentMails = async (): Promise<Mail[]> => {
  log.info("Get sent mails")
  const resp = await GET<Mail[]>("/mails/sent")
  if (resp instanceof Error) return []
  return resp
}

export const getFiles = async (): Promise<UploadedFile[]> => {
  log.info("Get files")
  const resp = await GET<UploadedFile[]>("/storage/files")
  if (resp instanceof Error) return []
  return resp
}

export const getMailAttachments = async (mailId: number): Promise<UploadedFile[]> => {
  log.info(`Get mail attachments mailId: ${mailId}`)
  const resp = await GET<UploadedFile[]>(`/mails/${mailId}/attachments`)
  if (resp instanceof Error) return []
  return resp
}

export const uploadFiles = async (
  files: {
    name: string
    type: string
    size: number
    data: Uint8Array
    kind?: "file" | "voice_note"
  }[]
): Promise<(UploadedFile | null)[]> => {
  log.info(`Upload files count: ${files.length}`)
  const links = await POST<
    { files: { originalName: string; mimeType?: string; size?: number; kind?: string }[] },
    UploadLink[]
  >("/storage/upload-links", {
    files: files.map((f) => ({
      originalName: f.name,
      mimeType: f.type || undefined,
      size: f.size,
      kind: f.kind,
    })),
  })
  if (links instanceof Error) return files.map(() => null)

  log.info(`Upload files to storage count: ${links.length}`)
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
  log.info(
    `Send mail to: ${payload.to.join(",")} attachments: ${payload.attachmentIds?.length ?? 0}`
  )
  const resp = await POST<typeof payload, Mail>("/mails", payload)
  if (resp instanceof Error) return null
  return resp
}

export const getDrafts = async (): Promise<Mail[]> => {
  log.info("Get drafts")
  const resp = await GET<Mail[]>("/mails/drafts")
  if (resp instanceof Error) return []
  return resp
}

export const saveDraft = async (payload: DraftMailSchema): Promise<Mail | null> => {
  log.info(`Save draft recipients: ${payload.to?.length ?? 0}`)
  const resp = await POST<DraftMailSchema, Mail>("/mails/drafts", payload)
  if (resp instanceof Error) return null
  return resp
}

export const updateDraft = async (
  id: number,
  payload: DraftMailSchema
): Promise<Mail | null> => {
  log.info(`Update draft: ${id} recipients: ${payload.to?.length ?? 0}`)
  const resp = await PUT<DraftMailSchema, Mail>(`/mails/drafts/${id}`, payload)
  if (resp instanceof Error) return null
  return resp
}

export const deleteDraft = async (id: number): Promise<boolean> => {
  log.info(`Delete draft: ${id}`)
  const resp = await DELETE(`/mails/drafts/${id}`)
  return !(resp instanceof Error)
}

export const sendDraft = async (id: number): Promise<Mail | null> => {
  log.info(`Send draft: ${id}`)
  const resp = await POST<null, Mail>(`/mails/drafts/${id}/send`, null)
  if (resp instanceof Error) return null
  return resp
}

export const moveMailToFolder = async (
  id: number,
  payload: MoveMailToFolderSchema
): Promise<Mail | null> => {
  log.info(`Move mail to folder: ${payload.folderId} mailId: ${id}`)
  const resp = await PUT<MoveMailToFolderSchema, Mail>(`/mails/${id}/folder`, payload)
  if (resp instanceof Error) return null
  return resp
}

export const markMailSpam = async (
  id: number,
  payload: MarkSpamSchema
): Promise<Mail | null> => {
  log.info(`Mark mail spam: ${id} isSpam: ${payload.isSpam}`)
  const resp = await PUT<MarkSpamSchema, Mail>(`/mails/${id}/spam`, payload)
  if (resp instanceof Error) return null
  return resp
}

export const markMailImportant = async (
  id: number,
  payload: MarkImportantSchema
): Promise<Mail | null> => {
  log.info(`Mark mail important: ${id} important: ${payload.important}`)
  const resp = await PUT<MarkImportantSchema, Mail>(`/mails/${id}/star`, payload)
  if (resp instanceof Error) return null
  return resp
}

export const markMailRead = async (id: number, isRead: boolean): Promise<Mail | null> => {
  log.info(`Mark mail read: ${id} isRead: ${isRead}`)
  const resp = await PUT<{ isRead: boolean }, Mail>(`/mails/${id}/read`, { isRead })
  if (resp instanceof Error) return null
  return resp
}

export const getTrashMails = async (): Promise<Mail[]> => {
  log.info("Get trash mails")
  const resp = await GET<Mail[]>("/mails/trash")
  if (resp instanceof Error) return []
  return resp
}

export const getSpamMails = async (): Promise<Mail[]> => {
  log.info("Get spam mails")
  const resp = await GET<Mail[]>("/mails/spam")
  if (resp instanceof Error) return []
  return resp
}

export const trashMail = async (id: number): Promise<Mail | null> => {
  log.info(`Trash mail: ${id}`)
  const resp = await PUT<undefined, Mail>(`/mails/${id}/trash`, undefined)
  if (resp instanceof Error) return null
  return resp
}

export const restoreMail = async (id: number): Promise<Mail | null> => {
  log.info(`Restore mail: ${id}`)
  const resp = await PUT<undefined, Mail>(`/mails/${id}/restore`, undefined)
  if (resp instanceof Error) return null
  return resp
}

export const permanentlyDeleteMail = async (id: number): Promise<boolean> => {
  log.info(`Permanently delete mail: ${id}`)
  const resp = await DELETE(`/mails/${id}`)
  return !(resp instanceof Error)
}

export const forwardMail = async (
  id: number,
  payload: ForwardMailSchema
): Promise<Mail | null> => {
  log.info(`Forward mail: ${id} to: ${payload.to.join(",")}`)
  const resp = await POST<ForwardMailSchema, Mail>(`/mails/${id}/forward`, payload)
  if (resp instanceof Error) return null
  return resp
}

export const getScheduledMails = async (): Promise<Mail[]> => {
  log.info("Get scheduled mails")
  const resp = await GET<Mail[]>("/mails/scheduled")
  if (resp instanceof Error) return []
  return resp
}

export const scheduleMail = async (payload: ScheduleMailSchema): Promise<Mail | null> => {
  log.info(`Schedule mail to: ${payload.to.join(",")} scheduledAt: ${payload.scheduledAt}`)
  const resp = await POST<ScheduleMailSchema, Mail>("/mails/schedule", payload)
  if (resp instanceof Error) return null
  return resp
}

export const rescheduleMail = async (
  id: number,
  payload: RescheduleMailSchema
): Promise<Mail | null> => {
  log.info(`Reschedule mail: ${id} scheduledAt: ${payload.scheduledAt}`)
  const resp = await PUT<RescheduleMailSchema, Mail>(`/mails/${id}/schedule`, payload)
  if (resp instanceof Error) return null
  return resp
}

export const cancelScheduledMail = async (id: number): Promise<Mail | null> => {
  log.info(`Cancel scheduled mail: ${id}`)
  const resp = await DELETE<Mail>(`/mails/${id}/schedule`)
  if (resp instanceof Error) return null
  return resp
}

export const setupMailAccountProfile = async (
  data: SetupMailAccountProfileSchema
): Promise<MailAccountProfile | Error> => {
  log.info("Setup mail account profile")
  return POST<SetupMailAccountProfileSchema, MailAccountProfile>("/setup-profile", data)
}

type MailLoginResponse =
  | { requiresTwoFactor: false; token: string; expiresAt: string }
  | { requiresTwoFactor: true; challengeToken: string; expiresAt: string }

export const forgotMailAccountPassword = async (payload: ForgotPasswordSchema) => {
  log.info(`Forgot mail account password email: ${payload.email}`)
  const resp = await POST<ForgotPasswordSchema, null>("/auth/forgot-password", payload)
  return resp
}

export const resetMailAccountPassword = async (payload: ResetPasswordSchema) => {
  log.info(`Reset mail account password email: ${payload.email}`)
  const resp = await POST<ResetPasswordSchema, null>("/auth/reset-password", payload)
  return resp
}

export const loginMailAccount = async (data: SignInSchema) => {
  log.info(`Login mail account email: ${data.email}`)
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
  log.info("Verify mail account two-factor")
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
  log.info("Set mail auth cookie")
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
  log.info("Logout mail account")
  const _cookies = await cookies()
  _cookies.delete("MAIL_AUTH_TOKEN")
  return true
}
