"use server"
import { GET, POST, DELETE } from "@/lib/api"
import type { OnboardingRegisterDomainSchema } from "@/schemas/onboarding.schemas"
import type { Domain } from "@/types"

export const listDomains = async (): Promise<Domain[]> => {
  const resp = await GET<Domain[]>("/domains")
  if (resp instanceof Error) return []
  return resp
}

export const addDomain = async (
  data: OnboardingRegisterDomainSchema
): Promise<Domain | null> => {
  const resp = await POST<OnboardingRegisterDomainSchema, Domain>("/domains", data)
  if (resp instanceof Error) return null
  return resp
}

export const deleteDomain = async (id: number): Promise<boolean> => {
  const resp = await DELETE(`/domains/${id}`)
  return !(resp instanceof Error)
}
