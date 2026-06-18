import { OnboardingPay } from "@/components/onboarding-pay"
import { getI18n, getStaticParams, setStaticParamsLocale } from "@/lib/i18n/server"
import { Metadata } from "next"
import { notFound } from "next/navigation"
export function generateStaticParams() {
  return getStaticParams()
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  setStaticParamsLocale(locale)
  const t = await getI18n()
  return {
    title: t("onboarding.pay.meta.title"),
    description: t("onboarding.pay.meta.description"),
  }
}
export default async function page({
  searchParams,
}: {
  searchParams: Promise<{ domain?: string }>
}) {
  const { domain } = await searchParams
  if (!domain) notFound()
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl leading-normal font-bold">
          Complete your paymemt
        </h3>
        <p className="text-sm leading-normal opacity-70">
          You are on the last step, just fill in your card infos to get started
        </p>
      </div>
      <OnboardingPay domainParams={domain} />
    </div>
  )
}
