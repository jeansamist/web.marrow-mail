"use client"

import { useOnboarding } from "@/contexts/onboarding.context"
import { useCurrentLocaleUrl } from "@/lib/i18n/client"
import { useRouter } from "next/navigation"
import { FunctionComponent, useEffect } from "react"
import { OnboardingPayForm } from "./forms/onboarding-pay.form"

export type OnboardingPayProps = {
  domainParams: string
  [key: string]: unknown
}

export const OnboardingPay: FunctionComponent<OnboardingPayProps> = ({
  domainParams,
}) => {
  const onboarding = useOnboarding()
  const { currentLocaleUrl } = useCurrentLocaleUrl()
  const router = useRouter()

  useEffect(() => {
    const contextStepValues = onboarding.steps[0].values as
      | { domain?: string }
      | undefined
    const contextDomain = contextStepValues?.domain
    if (contextDomain && contextDomain !== domainParams) {
      router.push(currentLocaleUrl(`/onboarding/`))
    }
  }, [currentLocaleUrl, domainParams, onboarding.steps, router])

  useEffect(() => {
    onboarding.setCurrentStep(3)
  }, [onboarding])

  return <OnboardingPayForm domainParams={domainParams} />
}
