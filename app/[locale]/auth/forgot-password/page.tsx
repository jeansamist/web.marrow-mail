import { ForgotPasswordForm } from "@/components/forms/forgot-password.form"
import { getI18n, getStaticParams } from "@/lib/i18n/server"
import { Metadata } from "next"

export function generateStaticParams() {
  return getStaticParams()
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getI18n()
  return {
    title: t("auth.forgotPassword.meta.title"),
    description: t("auth.forgotPassword.meta.description"),
  }
}
export default async function page() {
  const t = await getI18n()
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl leading-normal font-bold">
          {t("auth.forgotPassword.page.title")}
        </h3>
        <p className="ext-xs leading-normal opacity-70">
          {t("auth.forgotPassword.page.description")}
        </p>
      </div>
      <ForgotPasswordForm />
    </div>
  )
}
