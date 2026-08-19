"use server"
import { GET, POST, PUT, DELETE } from "@/lib/api"
import type { OnboardingRegisterDomainSchema } from "@/schemas/onboarding.schemas"
import type { Domain, DomainBranding, PublicDomainBranding, UploadLink } from "@/types"

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

export const getDomainBranding = async (domainId: number): Promise<DomainBranding | null> => {
  const resp = await GET<DomainBranding | null>(`/domains/${domainId}/branding`)
  if (resp instanceof Error) return null
  return resp
}

export const getPublicDomainBranding = async (
  domainName: string
): Promise<PublicDomainBranding | null> => {
  const resp = await GET<PublicDomainBranding>(`/domains/${domainName}/public-branding`)
  if (resp instanceof Error) return null
  return resp
}

type UpdateDomainBrandingPayload = {
  companyName?: string | null
  welcomeMessage?: string | null
  accentColor?: string | null
  logoFileId?: number | null
}

export const updateDomainBranding = async (
  domainId: number,
  data: UpdateDomainBrandingPayload
): Promise<DomainBranding | null> => {
  const resp = await PUT<UpdateDomainBrandingPayload, DomainBranding>(
    `/domains/${domainId}/branding`,
    data
  )
  if (resp instanceof Error) return null
  return resp
}

export const createDomainLogoUploadLink = async (
  domainId: number,
  data: { originalName: string; mimeType?: string; size?: number }
): Promise<UploadLink | null> => {
  const resp = await POST<typeof data, UploadLink>(
    `/domains/${domainId}/branding/logo-upload-link`,
    data
  )
  if (resp instanceof Error) return null
  return resp
}

export const setDomainCustomLoginHostname = async (
  domainId: number,
  hostname: string
): Promise<Domain | null> => {
  const resp = await PUT<{ hostname: string }, Domain>(
    `/domains/${domainId}/custom-login-hostname`,
    { hostname }
  )
  if (resp instanceof Error) return null
  return resp
}

export const verifyDomainCustomLoginHostname = async (
  domainId: number
): Promise<boolean | null> => {
  const resp = await POST<undefined, { verified: boolean }>(
    `/domains/${domainId}/custom-login-hostname/verify`,
    undefined
  )
  if (resp instanceof Error) return null
  return resp.verified
}
