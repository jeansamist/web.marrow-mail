import { ForgotPasswordForm } from "@/components/forms/forgot-password.form"
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
    title: t("auth.forgotPassword.meta.title"),
    description: t("auth.forgotPassword.meta.description"),
  }
}

export default async function ForgotPasswordPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setStaticParamsLocale(locale)
  const t = await getI18n()
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl leading-normal font-bold">
          {t("auth.forgotPassword.page.title")}
        </h3>
        <p className="text-xs leading-normal opacity-70">
          {t("auth.forgotPassword.page.description")}
        </p>
      </div>
      <ForgotPasswordForm />
    </div>
  )
}
