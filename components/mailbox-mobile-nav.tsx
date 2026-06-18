"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { useParams, usePathname } from "next/navigation"

const NAV_ITEMS = [
  { label: "Inbox", segment: "inbox" },
  { label: "Sent", segment: "sent" },
  { label: "Files", segment: "files" },
]

export function MailboxMobileNav() {
  const params = useParams<{ locale: string; domainName: string }>()
  const pathname = usePathname()
  const base = `/${params.locale}/domain/${params.domainName}`

  return (
    <div className="flex gap-1 px-4 pt-4 md:hidden">
      {NAV_ITEMS.map(({ label, segment }) => {
        const href = `${base}/${segment}`
        return (
          <Link
            key={segment}
            href={href}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent",
              pathname === href && "bg-accent"
            )}
          >
            {label}
          </Link>
        )
      })}
    </div>
  )
}
