import { ComposeEmailDialog } from "@/components/compose-email-dialog"
import { InboxEmailItem } from "@/components/inbox-email-item"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MOCK_EMAILS } from "@/data/mock-emails"
import { FunctionComponent } from "react"

type InboxSidebarProps = {
  selectedId: number | null
  title: string
  description: string
}

export const InboxSidebar: FunctionComponent<InboxSidebarProps> = ({
  selectedId,
  title,
  description,
}) => {
  return (
    <>
      <div className="shrink-0 space-y-4 p-4 sm:p-6 lg:p-8">
        <div>
          <h3 className="text-2xl leading-normal font-bold">{title}</h3>
          <p className="text-sm leading-normal opacity-70">{description}</p>
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
    </>
  )
}
