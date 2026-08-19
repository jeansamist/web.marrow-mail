"use server"
import { GET, POST, DELETE } from "@/lib/api"
import type { RoleAlias } from "@/types"

export const listRoleAliases = async (domainId: number): Promise<RoleAlias[]> => {
  const resp = await GET<RoleAlias[]>(`/domains/${domainId}/role-aliases`)
  if (resp instanceof Error) return []
  return resp
}

export const createRoleAlias = async (
  domainId: number,
  data: { alias: string; mailAccountId: number }
): Promise<RoleAlias | Error> => {
  return POST<typeof data, RoleAlias>(`/domains/${domainId}/role-aliases`, data)
}

export const deleteRoleAlias = async (id: number): Promise<boolean> => {
  const resp = await DELETE(`/role-aliases/${id}`)
  return !(resp instanceof Error)
}
