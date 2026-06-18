"use client"

import { cn } from "@/lib/utils"
import { Inbox, Send } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const NAV_ITEMS = [
  { label: "Inbox", icon: Inbox, segment: "inbox" },
  { label: "Sent", icon: Send, segment: "sent" },
]

type Props = { locale: string; domainName: string }

export function MailboxNavSidebar({ locale, domainName }: Props) {
  const pathname = usePathname()
  const base = `/${locale}/domain/${domainName}`

  return (
    <div className="hidden md:flex flex-col w-44 shrink-0 rounded-2xl bg-background p-2 gap-1">
      {NAV_ITEMS.map(({ label, icon: Icon, segment }) => {
        const href = `${base}/${segment}`
        return (
          <Link
            key={segment}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent",
              pathname === href && "bg-accent"
            )}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </Link>
        )
      })}
    </div>
  )
}
