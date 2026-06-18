"use client"

import { useI18n } from "@/lib/i18n/client"
import { ChevronDown } from "lucide-react"
import { useState } from "react"

type FaqItem = { q: string; a: string }

export function LandingFaq({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="divide-y divide-border">
      {items.map((item, i) => (
        <div key={i}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-medium transition-colors hover:text-primary"
          >
            {item.q}
            <ChevronDown
              className={`size-4 shrink-0 transition-transform ${open === i ? "rotate-180" : ""}`}
            />
          </button>
          {open === i && (
            <p className="pb-4 text-sm leading-relaxed text-muted-foreground">
              {item.a}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
