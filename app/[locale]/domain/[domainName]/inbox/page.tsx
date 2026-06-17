import { ComposeEmailDialog } from "@/components/compose-email-dialog"
import { InboxEmailItem } from "@/components/inbox-email-item"
import {
  InboxEmailPreview,
  InboxEmptyPreview,
} from "@/components/inbox-email-preview"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MOCK_EMAILS } from "@/data/mock-emails"
import { getI18n, getStaticParams } from "@/lib/i18n/server"
import { Metadata } from "next"

export function generateStaticParams() {
  return getStaticParams()
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getI18n()
  return {
    title: t("mail.inbox.meta.title"),
    description: t("mail.inbox.meta.description"),
  }
}

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>
}) {
  const t = await getI18n()
  const { message } = await searchParams
  const selectedId = message ? parseInt(message, 10) : null
  const selectedEmail = selectedId
    ? (MOCK_EMAILS.find((m) => m.id === selectedId) ?? null)
    : null

  return (
    <div className="flex h-screen gap-2 bg-primary p-2">
      <ResizablePanelGroup orientation="horizontal" className="gap-1">
        <ResizablePanel
          defaultSize={450}
          maxSize={600}
          minSize={300}
          className="flex flex-col rounded-2xl bg-background"
        >
          <div className="shrink-0 space-y-4 p-6 lg:p-8">
            <div>
              <h3 className="text-2xl leading-normal font-bold">
                {t("mail.inbox.title")}
              </h3>
              <p className="text-sm leading-normal opacity-70">
                {t("mail.inbox.description")}
              </p>
            </div>
            <ComposeEmailDialog />
          </div>
          <ScrollArea className="flex-1">
            <div className="flex flex-col gap-1 px-2 pb-4">
              {MOCK_EMAILS.map((mail) => (
                <InboxEmailItem
                  key={mail.id}
                  mail={mail}
                  isSelected={mail.id === selectedId}
                />
              ))}
            </div>
          </ScrollArea>
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
  )
}
