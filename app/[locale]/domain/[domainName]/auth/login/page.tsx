import { MailLoginForm } from "@/components/forms/mail-login.form"
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
    title: t("mail.login.meta.title"),
    description: t("mail.login.meta.description"),
  }
}

export default async function MailLoginPage({
  params,
}: {
  params: Promise<{ locale: string; domainName: string }>
}) {
  const { locale, domainName } = await params
  setStaticParamsLocale(locale)
  const t = await getI18n()
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl leading-normal font-bold">
          {t("mail.login.page.title")}
        </h3>
        <p className="text-xs leading-normal opacity-70">
          {t("mail.login.page.description")}
        </p>
      </div>
      <MailLoginForm domainName={domainName} />
    </div>
  )
}
