"use server"
import { GET, POST, PUT, DELETE } from "@/lib/api"
import { createLogger } from "@/lib/logger"
import type { OnboardingRegisterDomainSchema } from "@/schemas/onboarding.schemas"
import type { Domain, DomainBranding, PublicDomainBranding, UploadLink } from "@/types"

const log = createLogger("domain")

export const listDomains = async (): Promise<Domain[]> => {
  log.info("List domains for current user")
  const resp = await GET<Domain[]>("/domains")
  if (resp instanceof Error) return []
  return resp
}

export const addDomain = async (
  data: OnboardingRegisterDomainSchema
): Promise<Domain | null> => {
  log.info(`Add domain name: ${data.name}`)
  const resp = await POST<OnboardingRegisterDomainSchema, Domain>("/domains", data)
  if (resp instanceof Error) return null
  return resp
}

export const deleteDomain = async (id: number): Promise<boolean> => {
  log.info(`Delete domain id: ${id}`)
  const resp = await DELETE(`/domains/${id}`)
  return !(resp instanceof Error)
}

export const getDomainBranding = async (domainId: number): Promise<DomainBranding | null> => {
  log.info(`Get domain branding domainId: ${domainId}`)
  const resp = await GET<DomainBranding | null>(`/domains/${domainId}/branding`)
  if (resp instanceof Error) return null
  return resp
}

export const getPublicDomainBranding = async (
  domainName: string
): Promise<PublicDomainBranding | null> => {
  log.info(`Get public domain branding domainName: ${domainName}`)
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
  log.info(
    `Update domain branding domainId: ${domainId} companyName: ${data.companyName} accentColor: ${data.accentColor} logoFileId: ${data.logoFileId}`
  )
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
  log.info(
    `Create domain logo upload link domainId: ${domainId} originalName: ${data.originalName} mimeType: ${data.mimeType} size: ${data.size}`
  )
  const resp = await POST<typeof data, UploadLink>(
    `/domains/${domainId}/branding/logo-upload-link`,
    data
  )
  if (resp instanceof Error) return null
  return resp
}

// Does the S3 PUT server-side (like services/mail.services.ts's uploadFiles) —
// the bucket has no CORS policy for direct browser uploads, so the presigned
// URL must be consumed from the server, not the client. The returned file is
// the raw backend record (id only matters here) — unlike mail-account
// attachments, domain-branding logos have no publicUrl of their own; the
// team-login page resolves a display URL separately via public-branding.
export const uploadDomainLogo = async (
  domainId: number,
  file: { name: string; type: string; size: number; data: Uint8Array }
): Promise<{ id: number } | null> => {
  log.info(
    `Upload domain logo domainId: ${domainId} name: ${file.name} type: ${file.type} size: ${file.size}`
  )
  const link = await createDomainLogoUploadLink(domainId, {
    originalName: file.name,
    mimeType: file.type || undefined,
    size: file.size,
  })
  if (!link) return null

  const headers: HeadersInit = {}
  if (file.type) headers["Content-Type"] = file.type

  log.info(
    `Upload domain logo to storage domainId: ${domainId} fileId: ${link.file.id}`
  )
  const res = await fetch(link.uploadUrl, {
    method: "PUT",
    body: Buffer.from(file.data),
    headers,
  })
  if (!res.ok) return null

  return link.file
}

export const setDomainCustomLoginHostname = async (
  domainId: number,
  hostname: string
): Promise<Domain | null> => {
  log.info(
    `Set domain custom login hostname domainId: ${domainId} hostname: ${hostname}`
  )
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
  log.info(`Verify domain custom login hostname domainId: ${domainId}`)
  const resp = await POST<undefined, { verified: boolean }>(
    `/domains/${domainId}/custom-login-hostname/verify`,
    undefined
  )
  if (resp instanceof Error) return null
  return resp.verified
}
