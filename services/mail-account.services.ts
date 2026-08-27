"use server"
import { GET, DELETE, POST, PUT } from "@/lib/api"
import { createLogger } from "@/lib/logger"
import type { MailAccount } from "@/types"

const log = createLogger("mail-account")

export const listMailAccounts = async (): Promise<MailAccount[]> => {
  log.info("List mail accounts")
  const resp = await GET<MailAccount[]>("/mail-accounts")
  if (resp instanceof Error) return []
  return resp
}

export const deleteMailAccountApi = async (id: number): Promise<boolean> => {
  log.info(`Delete mail account: ${id}`)
  const resp = await DELETE(`/mail-accounts/${id}`)
  return !(resp instanceof Error)
}

export const toggleMailAccountActive = async (id: number): Promise<MailAccount | null> => {
  log.info(`Toggle mail account active: ${id}`)
  const resp = await PUT<undefined, MailAccount>(`/mail-accounts/${id}/toggle-active`, undefined)
  if (resp instanceof Error) return null
  return resp
}

export const resendMailAccountInvite = async (id: number): Promise<boolean> => {
  log.info(`Resend mail account invite: ${id}`)
  const resp = await POST<undefined, null>(`/mail-accounts/${id}/resend-invite`, undefined)
  return !(resp instanceof Error)
}
