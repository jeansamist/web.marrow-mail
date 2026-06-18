import { OnboardingCreateEmailForm } from "@/components/forms/onboarding-create-email.form"
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
    title: t("onboarding.create-addresses.meta.title"),
    description: t("onboarding.create-addresses.meta.description"),
  }
}
export default async function Page({
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
          Create email address
        </h3>
        <p className="text-sm leading-normal opacity-70">
          Create your email address and start sending emails
        </p>
      </div>
      <OnboardingCreateEmailForm domainParams={domain} />
    </div>
  )
}
