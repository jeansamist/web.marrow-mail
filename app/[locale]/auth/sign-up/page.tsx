import { SignUpForm } from "@/components/forms/sign-up.form"
import { getI18n, getStaticParams } from "@/lib/i18n/server"
import { Metadata } from "next"

export function generateStaticParams() {
  return getStaticParams()
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getI18n()
  return {
    title: t("auth.signUp.meta.title"),
    description: t("auth.signUp.meta.description"),
  }
}
export default async function page() {
  const t = await getI18n()
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl leading-normal font-bold">
          {t("auth.signUp.page.title")}
        </h3>
        <p className="ext-xs leading-normal opacity-70">
          {t("auth.signUp.page.description")}
        </p>
      </div>
      <SignUpForm />
    </div>
  )
}
