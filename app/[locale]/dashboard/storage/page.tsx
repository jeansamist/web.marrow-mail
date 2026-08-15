"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { PackageOpen } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { DashboardShell } from "@/components/dashboard/shell";
import { StorageWarningBanner } from "@/components/dashboard/storage-warning-banner";
import { premiumButton } from "@/components/onboarding/styles";
import { cn } from "@/lib/utils";
import {
  PLANS,
  getMailboxStorageUsedGB,
  getMailboxesNeedingStorageAttention,
  getStorageTier,
  loadAccount,
  storageTierBarClass,
  type OnboardingAccount,
} from "@/lib/onboarding";

function initials(value: string) {
  return value
    .split(/[.\s_-]+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function StoragePage() {
  const t = useTranslations("Dashboard.storagePage");
  const tMailboxes = useTranslations("Dashboard.mailboxesPage");
  const router = useRouter();
  const [account, setAccount] = useState<OnboardingAccount | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const stored = loadAccount();
    if (!stored) {
      router.replace("/onboarding");
      return;
    }
    setAccount(stored);
    setChecked(true);
  }, [router]);

  if (!checked || !account) return null;

  const purchasedGB = account.mailboxes.reduce((sum, m) => sum + m.storagePurchasedGB, 0);
  const usedGB = account.mailboxes.reduce(
    (sum, m) => sum + getMailboxStorageUsedGB(m),
    0,
  );
  const availableGB = Math.max(purchasedGB - usedGB, 0);
  const usageFraction = purchasedGB > 0 ? Math.min(usedGB / purchasedGB, 1) : 0;

  const baseGB = account.mailboxes.length * PLANS[account.plan].storageGB;
  const extraGB = Math.max(purchasedGB - baseGB, 0);
  const attention = getMailboxesNeedingStorageAttention(account);

  const topUsage = [...account.mailboxes]
    .map((m) => ({ m, used: getMailboxStorageUsedGB(m) }))
    .sort((a, b) => b.used - a.used)
    .slice(0, 5);

  return (
    <DashboardShell domain={account.domain} ownerName={account.ownerName}>
      <div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {t("title")}
          </h1>
          <Button className={cn(premiumButton)} asChild>
            <Link href="/dashboard/mailboxes">
              <PackageOpen className="size-4" strokeWidth={1.5} />
              {t("buyMore")}
            </Link>
          </Button>
        </div>
        <p className="mt-1.5 text-base text-muted-foreground">{t("subtitle")}</p>
      </div>

      {(attention.critical.length > 0 || attention.warning.length > 0) && (
        <div className="mt-6 flex flex-col gap-3">
          {attention.critical.map((mailbox) => (
            <StorageWarningBanner
              key={mailbox.id}
              mailbox={mailbox}
              domain={account.domain}
              tier="critical"
            />
          ))}
          {attention.warning.map((mailbox) => (
            <StorageWarningBanner
              key={mailbox.id}
              mailbox={mailbox}
              domain={account.domain}
              tier="warning"
            />
          ))}
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="grid grid-cols-3 divide-x divide-border/70">
          <div className="pr-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground/75">
              {t("purchased")}
            </p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground sm:text-4xl">
              {purchasedGB.toFixed(1)}
              <span className="text-lg font-semibold"> GB</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {extraGB > 0
                ? t("purchasedBreakdownExtra", {
                    base: baseGB,
                    extra: extraGB.toFixed(1),
                    count: account.mailboxes.length,
                  })
                : t("purchasedBreakdown", {
                    base: baseGB,
                    count: account.mailboxes.length,
                  })}
            </p>
          </div>
          <div className="px-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground/75">
              {t("used")}
            </p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground sm:text-4xl">
              {usedGB.toFixed(1)}
              <span className="text-lg font-semibold"> GB</span>
            </p>
          </div>
          <div className="pl-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground/75">
              {t("available")}
            </p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground sm:text-4xl">
              {availableGB.toFixed(1)}
              <span className="text-lg font-semibold"> GB</span>
            </p>
          </div>
        </div>

        <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-muted ring-1 ring-inset ring-border/50">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-300",
              storageTierBarClass(getStorageTier(usageFraction)),
            )}
            style={{ width: `${usageFraction * 100}%` }}
          />
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground/75">
          {t("topUsageTitle")}
        </h2>
        <div className="mt-4 flex flex-col gap-3">
          {topUsage.map(({ m, used }) => {
            const fraction = Math.min(used / m.storagePurchasedGB, 1);
            const tier = getStorageTier(fraction);
            return (
              <div
                key={m.id}
                className="flex items-center gap-3.5 rounded-2xl border border-border bg-card p-4"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {initials(m.fullName || m.username)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-medium text-foreground">
                      {m.username}@{account.domain}
                    </p>
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                      {tMailboxes("storageUsage", {
                        used: used.toFixed(1),
                        total: m.storagePurchasedGB,
                      })}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted ring-1 ring-inset ring-border/50">
                    <div
                      className={cn("h-full rounded-full", storageTierBarClass(tier))}
                      style={{ width: `${fraction * 100}%` }}
                    />
                  </div>
                </div>
                <Button size="sm" variant="outline" className="shrink-0" asChild>
                  <Link href="/dashboard/mailboxes">{t("manage")}</Link>
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardShell>
  );
}
