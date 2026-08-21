"use server"
import { GET, POST } from "@/lib/api"
import { CreateDomainPurchaseCheckoutSchema } from "@/schemas/onboarding.schemas"

export type DomainPurchaseCheckoutResult =
  | { paymentId: number; clientSecret: string | null }
  | { paymentId: number; transactionId: string }

export interface DomainPurchaseStatus {
  status: string
  domainName?: string
}

export interface DomainSearchResult {
  domain: string
  available: boolean
  priceUsd: number
}

// Checks every supported TLD for a base name in a single request, rather
// than firing one request per TLD — much less fragile (one bad TLD lookup
// no longer drops the whole search).
export const searchDomains = async (slug: string) => {
  return POST<{ slug: string }, DomainSearchResult[]>("/domain-purchase/search", {
    slug,
  })
}

export const createDomainPurchaseCheckout = async (
  data: CreateDomainPurchaseCheckoutSchema
) => {
  return POST<CreateDomainPurchaseCheckoutSchema, DomainPurchaseCheckoutResult>(
    "/domain-purchase/checkout",
    data
  )
}

export const getDomainPurchaseStatus = async (paymentId: number) => {
  return GET<DomainPurchaseStatus>(`/domain-purchase/status/${paymentId}`)
}

export const getDomainRegistrationStatus = async (domainName: string) => {
  return GET<{ registrationStatus: string }>(
    `/domain-purchase/registration-status/${domainName}`
  )
}
