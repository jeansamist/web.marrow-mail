import { InboxSidebar } from "@/components/inbox-sidebar"
import {
  InboxEmailPreview,
  InboxEmptyPreview,
} from "@/components/inbox-email-preview"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { MOCK_EMAILS } from "@/data/mock-emails"
import { getI18n, setStaticParamsLocale } from "@/lib/i18n/server"
import { Metadata } from "next"


export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
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
  params: Promise<{ locale: string }>
  searchParams: Promise<{ message?: string }>
}) {
  const { locale } = await params
  setStaticParamsLocale(locale)
  const t = await getI18n()
  const { message } = await searchParams
  const selectedId = message ? parseInt(message, 10) : null
  const selectedEmail = selectedId
    ? (MOCK_EMAILS.find((m) => m.id === selectedId) ?? null)
    : null

  const sidebarProps = {
    selectedId,
    title: t("mail.inbox.title"),
    description: t("mail.inbox.description"),
  }

  return (
    <>
      {/* ── Mobile: single-panel, list ↔ preview ── */}
      <div className="flex h-dvh flex-col bg-primary p-2 md:hidden">
        <div className="flex flex-1 flex-col overflow-hidden rounded-2xl bg-background">
          {selectedEmail ? (
            <InboxEmailPreview mail={selectedEmail} showBackButton />
          ) : (
            <InboxSidebar {...sidebarProps} />
          )}
        </div>
      </div>

      {/* ── Desktop: resizable two-panel ── */}
      <div className="hidden h-screen gap-2 bg-primary p-2 md:flex">
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
            {selectedEmail ? (
              <InboxEmailPreview mail={selectedEmail} />
            ) : (
              <InboxEmptyPreview />
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </>
  )
}
