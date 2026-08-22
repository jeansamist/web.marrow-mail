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
import { getStorageTier, storageTierBarClass } from "@/lib/onboarding";
import { listDomains } from "@/services/domain.services";
import { getStorageUsage } from "@/services/storage.services";
import { getProfile } from "@/services/auth.services";
import type { Domain, MailboxStorageUsage, User } from "@/types";

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

export default function StoragePage() {
  const t = useTranslations("Dashboard.storagePage");
  const tMailboxes = useTranslations("Dashboard.mailboxesPage");
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [domain, setDomain] = useState<Domain | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [mailboxes, setMailboxes] = useState<MailboxStorageUsage[]>([]);
  const [totalUsedBytes, setTotalUsedBytes] = useState(0);
  const [totalQuotaBytes, setTotalQuotaBytes] = useState(0);

  useEffect(() => {
    (async () => {
      const [domains, storage, user] = await Promise.all([
        listDomains(),
        getStorageUsage(),
        getProfile(),
      ]);
      if (domains.length === 0) {
        router.replace("/onboarding");
        return;
      }
      setDomain(domains[0]);
      setProfile(user);
      setMailboxes(storage?.mailboxes ?? []);
      setTotalUsedBytes(storage?.totalUsedBytes ?? 0);
      setTotalQuotaBytes(storage?.totalQuotaBytes ?? 0);
      setChecked(true);
    })();
  }, [router]);

  if (!checked || !domain) return null;

  const purchasedGB = totalQuotaBytes / BYTES_PER_GB;
  const usedGB = totalUsedBytes / BYTES_PER_GB;
  const availableGB = Math.max(purchasedGB - usedGB, 0);
  const usageFraction = purchasedGB > 0 ? Math.min(usedGB / purchasedGB, 1) : 0;
  const ownerName = profile ? `${profile.firstName} ${profile.lastName}`.trim() : "";

  const mailboxUsage = mailboxes.map((m) => ({
    ...m,
    usedGB: m.usedBytes / BYTES_PER_GB,
    quotaGB: m.quotaBytes / BYTES_PER_GB,
    fraction: m.quotaBytes > 0 ? Math.min(m.usedBytes / m.quotaBytes, 1) : 0,
  }));
  const critical = mailboxUsage.filter((m) => getStorageTier(m.fraction) === "critical");
  const warning = mailboxUsage.filter((m) => getStorageTier(m.fraction) === "warning");
  const topUsage = [...mailboxUsage].sort((a, b) => b.usedGB - a.usedGB).slice(0, 5);

  return (
    <DashboardShell domain={domain.name} ownerName={ownerName}>
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

      {(critical.length > 0 || warning.length > 0) && (
        <div className="mt-6 flex flex-col gap-3">
          {critical.map((m) => (
            <StorageWarningBanner
              key={m.mailAccountId}
              email={`${m.username}@${domain.name}`}
              usedGB={m.usedGB}
              quotaGB={m.quotaGB}
              tier="critical"
            />
          ))}
          {warning.map((m) => (
            <StorageWarningBanner
              key={m.mailAccountId}
              email={`${m.username}@${domain.name}`}
              usedGB={m.usedGB}
              quotaGB={m.quotaGB}
              tier="warning"
            />
          ))}
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="flex flex-col divide-y divide-border/70 sm:flex-row sm:divide-x sm:divide-y-0">
          <div className="flex-1 pb-4 sm:pb-0 sm:pr-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground/75">
              {t("purchased")}
            </p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground sm:text-4xl">
              {purchasedGB.toFixed(1)}
              <span className="text-lg font-semibold"> GB</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("purchasedBreakdown", {
                base: purchasedGB.toFixed(0),
                count: mailboxes.length,
              })}
            </p>
          </div>
          <div className="flex-1 py-4 sm:py-0 sm:px-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground/75">
              {t("used")}
            </p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground sm:text-4xl">
              {usedGB.toFixed(1)}
              <span className="text-lg font-semibold"> GB</span>
            </p>
          </div>
          <div className="flex-1 pt-4 sm:pt-0 sm:pl-4">
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
          {topUsage.map((m) => {
            const tier = getStorageTier(m.fraction);
            return (
              <div
                key={m.mailAccountId}
                className="flex items-center gap-3.5 rounded-2xl border border-border bg-card p-4"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {initials(m.username)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-medium text-foreground">
                      {m.username}@{domain.name}
                    </p>
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                      {tMailboxes("storageUsage", {
                        used: m.usedGB.toFixed(1),
                        total: m.quotaGB.toFixed(0),
                      })}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted ring-1 ring-inset ring-border/50">
                    <div
                      className={cn("h-full rounded-full", storageTierBarClass(tier))}
                      style={{ width: `${m.fraction * 100}%` }}
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
