import { setStaticParamsLocale } from "@/lib/i18n/server"
import { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  setStaticParamsLocale(locale)
  return { title: "Dashboard" }
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setStaticParamsLocale(locale)

  return (
    <div className="flex h-dvh items-center justify-center">
      <p className="text-sm text-muted-foreground">Dashboard coming soon</p>
    </div>
  )
}
