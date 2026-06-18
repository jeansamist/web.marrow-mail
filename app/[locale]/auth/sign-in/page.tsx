import { SignInForm } from "@/components/forms/sign-in.form"
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
    title: t("auth.signIn.meta.title"),
    description: t("auth.signIn.meta.description"),
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
          {t("auth.signIn.page.title")}
        </h3>
        <p className="ext-xs leading-normal opacity-70">
          {t("auth.signIn.page.description")}
        </p>
      </div>
      <SignInForm />
    </div>
  )
}
