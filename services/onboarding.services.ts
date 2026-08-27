"use server"
import { GET, POST } from "@/lib/api"
import { createLogger } from "@/lib/logger"
import {
  OnboardingCreateEmailSchema,
  OnboardingRegisterDomainSchema,
} from "@/schemas/onboarding.schemas"
import { Domain, MailAccount, Record } from "@/types"

const log = createLogger("onboarding")

export const registerDomain = async (data: OnboardingRegisterDomainSchema) => {
  log.info(`Register domain name: ${data.name}`)
  return POST<OnboardingRegisterDomainSchema, Domain>(
    "/onboarding/register-domain",
    data
  )
}

export const getDNSRecords = async (domainName: string) => {
  log.info(`Get DNS records domainName: ${domainName}`)
  return GET<Record[]>(`/onboarding/get-dns-records?domainName=${domainName}`)
}

export const checkDomainStatus = async (
  domainName: string
): Promise<boolean> => {
  log.info(`Check domain status domainName: ${domainName}`)
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
  log.info(
    `Setup mail account domainName: ${domainName} accounts: ${data.data.length}`
  )
  return POST<OnboardingCreateEmailSchema, MailAccount[]>(
    `/onboarding/setup-mail-account?domainName=${domainName}`,
    data
  )
}

