"use server"
import { GET, POST, DELETE } from "@/lib/api"
import { createLogger } from "@/lib/logger"
import type { RoleAlias } from "@/types"

const log = createLogger("role-alias")

export const listRoleAliases = async (domainId: number): Promise<RoleAlias[]> => {
  log.info(`List role aliases domain: ${domainId}`)
  const resp = await GET<RoleAlias[]>(`/domains/${domainId}/role-aliases`)
  if (resp instanceof Error) return []
  return resp
}

export const createRoleAlias = async (
  domainId: number,
  data: { alias: string; mailAccountId: number }
): Promise<RoleAlias | Error> => {
  log.info(
    `Create role alias domain: ${domainId} alias: ${data.alias} mail account: ${data.mailAccountId}`
  )
  return POST<typeof data, RoleAlias>(`/domains/${domainId}/role-aliases`, data)
}

export const deleteRoleAlias = async (id: number): Promise<boolean> => {
  log.info(`Delete role alias: ${id}`)
  const resp = await DELETE(`/role-aliases/${id}`)
  return !(resp instanceof Error)
}
