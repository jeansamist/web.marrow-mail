import { SignUpForm } from "@/components/forms/sign-up.form"
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
    title: t("auth.signUp.meta.title"),
    description: t("auth.signUp.meta.description"),
  }
}
export default async function page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setStaticParamsLocale(locale)
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
