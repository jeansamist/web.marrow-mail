import { MailboxNavSidebar } from "@/components/mailbox-nav-sidebar"

export default async function MailboxLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string; domainName: string }>
}) {
  const { locale, domainName } = await params
  return (
    <div className="flex h-dvh gap-2 bg-primary p-2">
      <MailboxNavSidebar locale={locale} domainName={domainName} />
      {children}
    </div>
  )
}
