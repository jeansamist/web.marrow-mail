import { VerifyEmailForm } from "@/components/forms/verify-email.form"
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
    title: t("auth.verifyEmail.meta.title"),
    description: t("auth.verifyEmail.meta.description"),
  }
}
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ email?: string }>
}) {
  const { locale } = await params
  setStaticParamsLocale(locale)
  const { email } = await searchParams
  const t = await getI18n()
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl leading-normal font-bold">
          {t("auth.verifyEmail.page.title")}
        </h3>
        <p className="ext-xs leading-normal opacity-70">
          {email && (
            <p>
              {t("auth.verifyEmail.sent")}{" "}
              <strong className="font-semibold text-foreground underline">
                {email}
              </strong>
              {t("auth.verifyEmail.checkInbox")}
            </p>
          )}
        </p>
      </div>
      <VerifyEmailForm email={email ?? ""} />
    </div>
  )
}
