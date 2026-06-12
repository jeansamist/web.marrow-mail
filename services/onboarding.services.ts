"use server"
import { GET, POST } from "@/lib/api"
import {
  OnboardingCreateEmailSchema,
  OnboardingPaySchema,
  OnboardingRegisterDomainSchema,
} from "@/schemas/onboarding.schemas"
import { Record } from "@/types"

export const registerDomain = async (data: OnboardingRegisterDomainSchema) => {
  return POST<OnboardingRegisterDomainSchema, Record[]>(
    "/onboarding/register-domain",
    data
  )
}

export const getDNSRecords = async (domainName: string) => {
  return GET<Record[]>(`/onboarding/get-dns-records?domainName=${domainName}`)
}

export const checkDomainStatus = async (
  domainName: string
): Promise<boolean> => {
  const resp = await GET<{ verified: boolean }>(
    `/onboarding/check-domain-status?domainName=${domainName}`
  )
  if (resp instanceof Error) {
    return false
  }
  return resp.verified
}

export const setupMailAccount = async (
  data: OnboardingCreateEmailSchema,
  domainName: string
) => {
  return POST<OnboardingCreateEmailSchema, unknown>(
    `/onboarding/setup-mail-account?domainName=${domainName}`,
    data
  )
}

export const processPayment = async (
  data: OnboardingPaySchema,
  domainName: string
) => {
  return POST<OnboardingPaySchema, unknown>(
    `/onboarding/process-payment?domainName=${domainName}`,
    data
  )
}
