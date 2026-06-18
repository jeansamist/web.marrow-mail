import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import type { Mail } from "@/types"
import { ArrowLeft, MailOpen } from "lucide-react"
import Link from "next/link"
import { FunctionComponent } from "react"

function emailInitials(email: string) {
  const local = email.split("@")[0]
  const parts = local.split(/[._-]/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return local.slice(0, 2).toUpperCase()
}

function formatMailDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString([], {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export const InboxEmptyPreview: FunctionComponent = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
      <MailOpen className="size-10 opacity-30" />
      <p className="text-sm">Select a message to read it</p>
    </div>
  )
}

type InboxEmailPreviewProps = {
  mail: Mail
  showBackButton?: boolean
}

export const InboxEmailPreview: FunctionComponent<InboxEmailPreviewProps> = ({
  mail,
  showBackButton = false,
}) => {
  const senderEmail =
    mail.direction === "inbound"
      ? mail.fromEmail
      : (mail.toAddresses[0] ?? "")
  const initials = emailInitials(senderEmail)

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-4 p-4 sm:p-6 lg:p-8">
        {showBackButton && (
          <Link
            href="?"
            scroll={false}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back
          </Link>
        )}
        <h2 className="text-xl font-bold leading-snug">{mail.subject}</h2>
        <div className="flex items-center gap-3">
          <Avatar className="size-10 shrink-0">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{senderEmail}</p>
            <p className="truncate text-xs text-muted-foreground">
              {formatMailDate(mail.createdAt)}
            </p>
          </div>
        </div>
      </div>

      <Separator />

      <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        {mail.bodyHtml ? (
          <div
            dangerouslySetInnerHTML={{ __html: mail.bodyHtml }}
            className="prose prose-sm max-w-none dark:prose-invert"
          />
        ) : (
          <p className="whitespace-pre-line text-sm leading-relaxed">
            {mail.bodyText ?? ""}
          </p>
        )}
      </div>
    </div>
  )
}
