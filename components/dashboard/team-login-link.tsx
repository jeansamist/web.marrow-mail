"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE_URL } from "@/lib/seo";

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return;
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
    } catch {
      // ignore — button state still confirms copy was attempted
    }
    document.body.removeChild(textarea);
  }
}

export function useLoginLinkCopy(domain: string) {
  const locale = useLocale();
  const [copied, setCopied] = useState(false);
  const loginUrl = `${SITE_URL}/${locale}/team-login/${domain}`;

  async function handleCopy() {
    await copyToClipboard(loginUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return { loginUrl, copied, handleCopy };
}

export function TeamLoginLinkCard({
  domain,
  title,
  description,
  copyLabel,
  copiedLabel,
}: {
  domain: string;
  title: string;
  description: string;
  copyLabel: string;
  copiedLabel: string;
}) {
  const { loginUrl, copied, handleCopy } = useLoginLinkCopy(domain);

  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-muted/30 py-1.5 pl-4 pr-1.5">
        <span className="flex-1 truncate font-mono text-sm text-foreground">
          {loginUrl}
        </span>
        <Button type="button" size="sm" variant="outline" onClick={handleCopy}>
          {copied ? (
            <Check className="size-3.5" strokeWidth={1.5} />
          ) : (
            <Copy className="size-3.5" strokeWidth={1.5} />
          )}
          {copied ? copiedLabel : copyLabel}
        </Button>
      </div>
    </div>
  );
}

export function TeamLoginLinkCompact({
  domain,
  copyLabel,
  copiedLabel,
}: {
  domain: string;
  copyLabel: string;
  copiedLabel: string;
}) {
  const { loginUrl, copied, handleCopy } = useLoginLinkCopy(domain);

  return (
    <div className="w-full mt-4 flex items-center gap-2 rounded-xl border border-border/70 bg-muted/30 py-1.5 pl-3.5 pr-1.5">
      <span className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground">
        {loginUrl}
      </span>
      <button
        type="button"
        onClick={handleCopy}
        className="flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
      >
        {copied ? (
          <Check className="size-3.5" strokeWidth={1.5} />
        ) : (
          <Copy className="size-3.5" strokeWidth={1.5} />
        )}
        {copied ? copiedLabel : copyLabel}
      </button>
    </div>
  );
}
