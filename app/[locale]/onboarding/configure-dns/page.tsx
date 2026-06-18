import { Globe } from "lucide-react"

import { OnboardingConfigureDNSTable } from "@/components/onboarding-configure-dns-table"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
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
    title: t("onboarding.configure-dns.meta.title"),
    description: t("onboarding.configure-dns.meta.description"),
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
        <h3 className="text-2xl leading-normal font-bold">Configure DNS</h3>
        <p className="text-sm leading-normal opacity-70">
          Add the provided DNS records to your domain
        </p>
      </div>
      <div>
        <Field>
          <FieldLabel htmlFor="input-group-url">Domain</FieldLabel>
          <InputGroup>
            <InputGroupInput id="input-group-url" value={domain} />
            <InputGroupAddon>
              <InputGroupText>https://</InputGroupText>
            </InputGroupAddon>
            <InputGroupAddon align="inline-end">
              <Globe />
            </InputGroupAddon>
          </InputGroup>
        </Field>
      </div>
      <OnboardingConfigureDNSTable domainParams={domain} />
    </div>
  )
}
