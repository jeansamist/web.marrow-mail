import {
  InboxEmailPreview,
  InboxEmptyPreview,
} from "@/components/inbox-email-preview"
import { InboxSidebar } from "@/components/inbox-sidebar"
import { MailboxNavSidebar } from "@/components/mailbox-nav-sidebar"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { getI18n, setStaticParamsLocale } from "@/lib/i18n/server"
import { getReceivedMails } from "@/services/mail.services"
import { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  setStaticParamsLocale(locale)
  const t = await getI18n()
  return {
    title: t("mail.inbox.meta.title"),
    description: t("mail.inbox.meta.description"),
  }
}

export default async function InboxPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; domainName: string }>
  searchParams: Promise<{ message?: string }>
}) {
  const { locale, domainName } = await params
  setStaticParamsLocale(locale)
  const t = await getI18n()
  const { message } = await searchParams

  const mails = await getReceivedMails()
  const selectedId = message ? parseInt(message, 10) : null
  const selectedMail = selectedId
    ? (mails.find((m) => m.id === selectedId) ?? null)
    : null

  const sidebarProps = {
    mails,
    selectedId,
    title: t("mail.inbox.title"),
    description: t("mail.inbox.description"),
  }

  return (
    <>
      {/* Mobile */}
      <div className="flex h-dvh flex-col bg-primary p-2 md:hidden">
        <div className="flex flex-1 flex-col overflow-hidden rounded-2xl bg-background">
          {selectedMail ? (
            <InboxEmailPreview mail={selectedMail} showBackButton />
          ) : (
            <InboxSidebar {...sidebarProps} />
          )}
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden h-screen gap-2 bg-primary p-2 md:flex">
        <MailboxNavSidebar locale={locale} domainName={domainName} />
        <ResizablePanelGroup orientation="horizontal" className="gap-1">
          <ResizablePanel
            defaultSize={450}
            maxSize={600}
            minSize={280}
            className="flex flex-col rounded-2xl bg-background"
          >
            <InboxSidebar {...sidebarProps} />
          </ResizablePanel>

          <ResizableHandle
            withHandle
            className="opacity-0 transition-opacity hover:opacity-100"
          />

          <ResizablePanel className="rounded-2xl bg-background">
            {selectedMail ? (
              <InboxEmailPreview mail={selectedMail} />
            ) : (
              <InboxEmptyPreview />
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </>
  )
}
