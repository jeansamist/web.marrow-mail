"use client";

import { useTranslations } from "next-intl";
import { HardDrive } from "lucide-react";
import { cn } from "@/lib/utils";
import { getStorageTier, storageTierBarClass } from "@/lib/onboarding";
import type { MailAccount } from "@/types";

const BYTES_PER_GB = 1024 ** 3;

function initials(value: string) {
  return value
    .split(/[.\s_-]+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function MailboxCard({
  mailAccount,
  domain,
  usedBytes,
  quotaBytes,
  onClick,
}: {
  mailAccount: MailAccount;
  domain: string;
  usedBytes: number;
  quotaBytes: number;
  onClick: () => void;
}) {
  const t = useTranslations("Dashboard.mailboxesPage");
  const usageFraction = quotaBytes > 0 ? Math.min(usedBytes / quotaBytes, 1) : 0;
  const tier = getStorageTier(usageFraction);

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_20px_40px_-24px_rgba(0,0,0,0.15)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {initials(mailAccount.username)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {mailAccount.username}
            </p>
            <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
              {mailAccount.username}@{domain}
            </p>
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold",
            mailAccount.active
              ? "bg-emerald-500/10 text-emerald-700"
              : "bg-muted text-muted-foreground",
          )}
        >
          {mailAccount.active ? t("status.active") : t("status.disabled")}
        </span>
      </div>

      <div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 tabular-nums">
            <HardDrive className="size-3" strokeWidth={1.5} />
            {t("storageUsage", {
              used: (usedBytes / BYTES_PER_GB).toFixed(1),
              total: (quotaBytes / BYTES_PER_GB).toFixed(0),
            })}
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted ring-1 ring-inset ring-border/50">
          <div
            className={cn(
              "h-full rounded-full transition-[width] duration-300",
              storageTierBarClass(tier),
            )}
            style={{ width: `${usageFraction * 100}%` }}
          />
        </div>
      </div>
    </button>
  );
}
