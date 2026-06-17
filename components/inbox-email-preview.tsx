import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import type { MockEmail } from "@/data/mock-emails"
import { ArrowLeft, MailOpen } from "lucide-react"
import Link from "next/link"
import { FunctionComponent } from "react"

export const InboxEmptyPreview: FunctionComponent = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
      <MailOpen className="size-10 opacity-30" />
      <p className="text-sm">Select a message to read it</p>
    </div>
  )
}

type InboxEmailPreviewProps = {
  mail: MockEmail
  showBackButton?: boolean
}

export const InboxEmailPreview: FunctionComponent<InboxEmailPreviewProps> = ({
  mail,
  showBackButton = false,
}) => {
  return (
    <div className="flex h-full flex-col">
      <div className="space-y-4 p-4 sm:p-6 lg:p-8">
        {showBackButton && (
          <Link
            href="?"
            scroll={false}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to inbox
          </Link>
        )}
        <h2 className="text-xl font-bold leading-snug">{mail.subject}</h2>
        <div className="flex items-center gap-3">
          <Avatar className="size-10 shrink-0">
            <AvatarImage
              src={`https://i.pravatar.cc/48?u=${mail.avatarSeed}`}
              alt={mail.sender}
            />
            <AvatarFallback>{mail.initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{mail.sender}</p>
            <p className="truncate text-xs text-muted-foreground">
              {mail.email}
            </p>
          </div>
          <span className="ml-auto shrink-0 text-xs text-muted-foreground">
            {mail.time}
          </span>
        </div>
      </div>

      <Separator />

      <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <p className="whitespace-pre-line text-sm leading-relaxed">{mail.body}</p>
      </div>
    </div>
  )
}
