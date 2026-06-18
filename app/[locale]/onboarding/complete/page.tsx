import { OnboardingComplete } from "@/components/onboarding-complete"
import { getI18n, getStaticParams, setStaticParamsLocale } from "@/lib/i18n/server"
import { Metadata } from "next"

export function generateStaticParams() {
  return getStaticParams()
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  setStaticParamsLocale(locale)
  const t = await getI18n()
  return {
    title: t("onboarding.complete.meta.title"),
    description: t("onboarding.complete.meta.description"),
  }
}

export default function Page() {
  return <OnboardingComplete />
}
