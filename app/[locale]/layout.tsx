import { AuthProvider } from "@/contexts/auth.context"
import { I18nProviderClient } from "@/lib/i18n/client"
import { getStaticParams } from "@/lib/i18n/server"
import { getProfile } from "@/services/auth.services"

export function generateStaticParams() {
  return getStaticParams()
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const user = await getProfile()

  return (
    <I18nProviderClient locale={locale}>
      <AuthProvider user={user}>{children}</AuthProvider>
    </I18nProviderClient>
  )
}
