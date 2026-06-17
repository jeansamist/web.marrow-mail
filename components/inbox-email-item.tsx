"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import type { MockEmail } from "@/data/mock-emails"
import {
  Archive,
  Forward,
  MailOpen,
  Reply,
  Star,
  Trash2,
} from "lucide-react"
import Link from "next/link"
import { FunctionComponent } from "react"

type InboxEmailItemProps = {
  mail: MockEmail
  isSelected: boolean
}

export const InboxEmailItem: FunctionComponent<InboxEmailItemProps> = ({
  mail,
  isSelected,
}) => {
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
            <AvatarImage
              src={`https://i.pravatar.cc/48?u=${mail.avatarSeed}`}
              alt={mail.sender}
            />
            <AvatarFallback>{mail.initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-semibold">
                {mail.sender}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {mail.time}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <h4 className="truncate text-sm font-medium">{mail.subject}</h4>
              {mail.unread && (
                <Badge className="size-2 shrink-0 rounded-full p-0" />
              )}
            </div>
            <p className="line-clamp-2 text-xs text-muted-foreground">
              {mail.preview}
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
          {mail.unread ? "Mark as read" : "Mark as unread"}
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
