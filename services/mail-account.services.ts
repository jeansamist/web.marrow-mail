"use server"
import { GET, DELETE } from "@/lib/api"
import type { MailAccount } from "@/types"

export const listMailAccounts = async (): Promise<MailAccount[]> => {
  const resp = await GET<MailAccount[]>("/mail-accounts")
  if (resp instanceof Error) return []
  return resp
}

export const deleteMailAccountApi = async (id: number): Promise<boolean> => {
  const resp = await DELETE(`/mail-accounts/${id}`)
  return !(resp instanceof Error)
}
