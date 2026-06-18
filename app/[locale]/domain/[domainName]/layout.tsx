import { AuthMailAccountProvider } from "@/contexts/auth-mail-account.context"
import { getMailAccountProfile } from "@/services/mail.services"

export const dynamic = "force-dynamic"

export default async function LocaleLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getMailAccountProfile()
  return (
    <AuthMailAccountProvider profile={profile}>
      {children}
    </AuthMailAccountProvider>
  )
}
