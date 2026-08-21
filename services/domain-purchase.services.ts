"use server"
import { GET, POST } from "@/lib/api"
import {
  CheckDomainAvailabilitySchema,
  CreateDomainPurchaseCheckoutSchema,
} from "@/schemas/onboarding.schemas"

export interface DomainAvailability {
  available: boolean
  priceUsd: number
}

export type DomainPurchaseCheckoutResult =
  | { paymentId: number; clientSecret: string | null }
  | { paymentId: number; transactionId: string }

export interface DomainPurchaseStatus {
  status: string
  domainName?: string
}

export const checkDomainAvailability = async (
  data: CheckDomainAvailabilitySchema
) => {
  return POST<CheckDomainAvailabilitySchema, DomainAvailability>(
    "/domain-purchase/check-availability",
    data
  )
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
