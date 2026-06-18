import {
  InboxEmailPreview,
  InboxEmptyPreview,
} from "@/components/inbox-email-preview"
import { InboxSidebar } from "@/components/inbox-sidebar"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { setStaticParamsLocale } from "@/lib/i18n/server"
import { getSentMails } from "@/services/mail.services"
import { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  setStaticParamsLocale(locale)
  return { title: "Sent" }
}

export default async function SentPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; domainName: string }>
  searchParams: Promise<{ message?: string }>
}) {
  const { locale } = await params
  setStaticParamsLocale(locale)
  const { message } = await searchParams

  const mails = await getSentMails()
  const selectedId = message ? parseInt(message, 10) : null
  const selectedMail = selectedId
    ? (mails.find((m) => m.id === selectedId) ?? null)
    : null

  const sidebarProps = {
    mails,
    selectedId,
    title: "Sent",
    description: "Emails you've sent",
  }

  return (
    <>
      {/* Mobile */}
      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl bg-background md:hidden">
        {selectedMail ? (
          <InboxEmailPreview mail={selectedMail} showBackButton />
        ) : (
          <InboxSidebar {...sidebarProps} />
        )}
      </div>

      {/* Desktop */}
      <ResizablePanelGroup
        orientation="horizontal"
        className="hidden md:flex gap-1 flex-1"
      >
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
    </>
  )
}
