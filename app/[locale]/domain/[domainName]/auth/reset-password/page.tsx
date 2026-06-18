import { ResetPasswordForm } from "@/components/forms/reset-password.form"
import { getI18n, setStaticParamsLocale } from "@/lib/i18n/server"
import { Metadata } from "next"
import { redirect } from "next/navigation"


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  setStaticParamsLocale(locale)
  const t = await getI18n()
  return {
    title: t("auth.resetPassword.meta.title"),
    description: t("auth.resetPassword.meta.description"),
  }
}

export default async function ResetPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ email?: string; resetPasswordToken?: string }>
}) {
  const { locale } = await params
  setStaticParamsLocale(locale)
  const { email, resetPasswordToken } = await searchParams

  if (!email || !resetPasswordToken) {
    redirect("/auth/sign-in")
  }

  const t = await getI18n()
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl leading-normal font-bold">
          {t("auth.resetPassword.page.title")}
        </h3>
        <p className="text-xs leading-normal opacity-70">
          {t("auth.resetPassword.page.description")}
        </p>
      </div>
      <ResetPasswordForm
        email={email}
        resetPasswordToken={resetPasswordToken}
      />
    </div>
  )
}
