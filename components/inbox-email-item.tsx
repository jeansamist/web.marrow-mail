"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { cn } from "@/lib/utils"
import type { Mail } from "@/types"
import { Archive, Forward, MailOpen, Reply, Star, Trash2 } from "lucide-react"
import Link from "next/link"
import { FunctionComponent } from "react"

function emailInitials(email: string) {
  const local = email.split("@")[0]
  const parts = local.split(/[._-]/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return local.slice(0, 2).toUpperCase()
}

function formatMailDate(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday"
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000)
  if (diffDays < 7) return date.toLocaleDateString([], { weekday: "short" })
  return date.toLocaleDateString([], { month: "short", day: "numeric" })
}

type InboxEmailItemProps = {
  mail: Mail
  isSelected: boolean
}

export const InboxEmailItem: FunctionComponent<InboxEmailItemProps> = ({
  mail,
  isSelected,
}) => {
  const displayEmail =
    mail.direction === "inbound"
      ? mail.fromEmail
      : (mail.toAddresses[0] ?? "")
  const initials = emailInitials(displayEmail)
  const preview =
    mail.bodyText?.slice(0, 120) ??
    mail.bodyHtml?.replace(/<[^>]+>/g, "").slice(0, 120) ??
    ""

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <Link
          href={`?message=${mail.id}`}
          scroll={false}
          className={cn(
            "flex items-start gap-4 rounded-xl p-4 transition-colors hover:bg-accent",
            isSelected && "bg-accent"
          )}
        >
          <Avatar className="mt-0.5 size-12 shrink-0">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-semibold">
                {displayEmail}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatMailDate(mail.createdAt)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <h4 className="truncate text-sm font-medium">{mail.subject}</h4>
              {mail.status === "pending" && (
                <Badge className="size-2 shrink-0 rounded-full p-0" />
              )}
            </div>
            <p className="line-clamp-2 text-xs text-muted-foreground">
              {preview}
            </p>
          </div>
        </Link>
      </ContextMenuTrigger>

      <ContextMenuContent>
        <ContextMenuItem>
          <Reply className="size-4" />
          Reply
          <ContextMenuShortcut>⌘R</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          <Forward className="size-4" />
          Forward
          <ContextMenuShortcut>⌘F</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem>
          <MailOpen className="size-4" />
          Mark as read
          <ContextMenuShortcut>⌘U</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          <Star className="size-4" />
          Star message
        </ContextMenuItem>
        <ContextMenuItem>
          <Archive className="size-4" />
          Archive
          <ContextMenuShortcut>⌘E</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem variant="destructive">
          <Trash2 className="size-4" />
          Delete
          <ContextMenuShortcut>⌫</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
