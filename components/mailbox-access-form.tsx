"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCurrentLocaleUrl, useI18n } from "@/lib/i18n/client"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function MailboxAccessForm() {
  const [domain, setDomain] = useState("")
  const { currentLocaleUrl } = useCurrentLocaleUrl()
  const router = useRouter()
  const t = useI18n()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = domain.trim()
    if (!trimmed) return
    router.push(currentLocaleUrl(`/domain/${encodeURIComponent(trimmed)}/auth/login`))
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full gap-2">
      <Input
        value={domain}
        onChange={(e) => setDomain(e.target.value)}
        placeholder={t("landing.mailbox.placeholder")}
        className="flex-1"
        autoComplete="off"
        spellCheck={false}
      />
      <Button type="submit" disabled={!domain.trim()}>
        {t("landing.mailbox.open")}
      </Button>
    </form>
  )
}
