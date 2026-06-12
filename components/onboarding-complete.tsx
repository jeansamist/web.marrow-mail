"use client"

import { useOnboarding } from "@/contexts/onboarding.context"
import { useCurrentLocaleUrl, useI18n } from "@/lib/i18n/client"
import { CheckCircle } from "lucide-react"
import Link from "next/link"
import { FunctionComponent, useEffect } from "react"
import { Button } from "./ui/button"

export type OnboardingCompleteProps = {
  [key: string]: unknown
}

export const OnboardingComplete: FunctionComponent<
  OnboardingCompleteProps
> = () => {
  const onboarding = useOnboarding()
  const t = useI18n()
  const { currentLocaleUrl } = useCurrentLocaleUrl()

  useEffect(() => {
    onboarding.setCurrentStep(4)
  }, [onboarding])

  return (
    <div className="flex flex-col items-center gap-6 py-12 text-center">
      <CheckCircle className="h-16 w-16 text-green-500" strokeWidth={1.5} />
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{t("onboarding.complete.title")}</h2>
        <p className="text-sm leading-normal opacity-70">
          {t("onboarding.complete.description")}
        </p>
      </div>
      <Button asChild>
        <Link href={currentLocaleUrl("/")}>{t("onboarding.complete.cta")}</Link>
      </Button>
    </div>
  )
}
