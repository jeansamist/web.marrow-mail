"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  AtSign,
  CheckCircle2,
  Globe,
  Mail,
  PackageOpen,
  Rocket,
  TriangleAlert,
  UserPlus,
} from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DashboardShell } from "@/components/dashboard/shell";
import { LauncherAction } from "@/components/dashboard/launcher-action";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { StatList } from "@/components/dashboard/stat-list";
import { TeamLoginLinkCompact } from "@/components/dashboard/team-login-link";
import { StorageWarningBanner } from "@/components/dashboard/storage-warning-banner";
import { PLANS, getStorageTier } from "@/lib/onboarding";
import { listDomains } from "@/services/domain.services";
import { listMailAccounts } from "@/services/mail-account.services";
import { getStorageUsage } from "@/services/storage.services";
import { getCurrentSubscription } from "@/services/subscription.services";
import { getProfile } from "@/services/auth.services";
import type { Domain, MailAccount, StorageUsage, Subscription, User } from "@/types";

const BYTES_PER_GB = 1024 ** 3;

function getGreetingKey(): "morning" | "afternoon" | "evening" {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

export default function DashboardPage() {
  const t = useTranslations("Dashboard");
  const tLink = useTranslations("Dashboard.loginLink");
  const router = useRouter();

  const [checked, setChecked] = useState(false);
  const [domain, setDomain] = useState<Domain | null>(null);
  const [domainCount, setDomainCount] = useState(0);
  const [mailAccounts, setMailAccounts] = useState<MailAccount[]>([]);
  const [storage, setStorage] = useState<StorageUsage | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [profile, setProfile] = useState<User | null>(null);

  useEffect(() => {
    (async () => {
      const [domains, accounts, storageUsage, currentSubscription, user] = await Promise.all([
        listDomains(),
        listMailAccounts(),
        getStorageUsage(),
        getCurrentSubscription(),
        getProfile(),
      ]);
      if (domains.length === 0) {
        router.replace("/onboarding");
        return;
      }
      setDomain(domains[0]);
      setDomainCount(domains.length);
      setMailAccounts(accounts);
      setStorage(storageUsage);
      setSubscription(currentSubscription);
      setProfile(user);
      setChecked(true);
    })();
  }, [router]);

  if (!checked || !domain) return null;

  const ownerName = profile ? `${profile.firstName} ${profile.lastName}`.trim() : "";
  const planName = PLANS[subscription?.planId ?? "core"].name;

  const totalUsedGB = storage ? storage.totalUsedBytes / BYTES_PER_GB : 0;
  const totalQuotaGB = storage ? storage.totalQuotaBytes / BYTES_PER_GB : 0;

  const mailboxUsage = (storage?.mailboxes ?? [])
    .map((m) => ({
      ...m,
      fraction: m.quotaBytes > 0 ? m.usedBytes / m.quotaBytes : 0,
    }))
    .sort((a, b) => b.fraction - a.fraction);
  const criticalMailboxes = mailboxUsage.filter((m) => getStorageTier(m.fraction) === "critical");
  const warningMailboxes = mailboxUsage.filter((m) => getStorageTier(m.fraction) === "warning");
  const nearLimitCount = criticalMailboxes.length + warningMailboxes.length;
  const disabledCount = mailAccounts.filter((a) => !a.active).length;

  const isHealthy = domain.verified && nearLimitCount === 0 && disabledCount === 0;

  const issues: string[] = [];
  if (!domain.verified) issues.push(t("health.domainsPending"));
  if (disabledCount > 0) issues.push(t("health.disabledMailboxes", { count: disabledCount }));
  if (nearLimitCount > 0)
    issues.push(t("health.storageNearLimit", { count: nearLimitCount }));

  const adaptiveMessage =
    mailAccounts.length === 0
      ? t("adaptive.firstLogin")
      : !domain.verified
        ? t("adaptive.domainNotVerified")
        : disabledCount > 0
          ? t("adaptive.disabledMailboxes", { count: disabledCount })
          : nearLimitCount > 0
            ? t("adaptive.lowStorage", { count: nearLimitCount })
            : t("adaptive.healthy");
  const AdaptiveIcon =
    mailAccounts.length === 0
      ? Rocket
      : !domain.verified
        ? TriangleAlert
        : disabledCount > 0
          ? UserPlus
          : nearLimitCount > 0
            ? TriangleAlert
            : null;
  const adaptiveIconTone =
    !domain.verified || disabledCount > 0 || nearLimitCount > 0
      ? "text-amber-600"
      : "text-primary";

  const checklist = [
    { ok: domain.verified, label: t("health.domainVerified") },
    { ok: disabledCount === 0, label: t("health.mailboxesHealthy") },
    { ok: nearLimitCount === 0, label: t("health.storageAvailable") },
    { ok: true, label: t("health.aiCreditsAvailable") },
  ];

  const recentMailboxes = [...mailAccounts]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <DashboardShell domain={domain.name} ownerName={ownerName}>
      {!domain.verified && (
        <div className="mb-8 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
          <TriangleAlert className="mt-0.5 size-5 shrink-0 text-amber-700" strokeWidth={1.5} />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-900">
              {t("dnsIncompleteTitle")}
            </p>
            <p className="mt-1 text-sm text-amber-800/80">
              {t("dnsIncompleteDescription", { domain: domain.name })}
            </p>
          </div>
          <Button size="sm" asChild>
            <Link href="/onboarding">{t("finishDns")}</Link>
          </Button>
        </div>
      )}

      {(criticalMailboxes.length > 0 || warningMailboxes.length > 0) && (
        <div className="mb-8 flex flex-col gap-3">
          {criticalMailboxes.map((m) => (
            <StorageWarningBanner
              key={m.mailAccountId}
              email={`${m.username}@${domain.name}`}
              usedGB={m.usedBytes / BYTES_PER_GB}
              quotaGB={m.quotaBytes / BYTES_PER_GB}
              tier="critical"
            />
          ))}
          {warningMailboxes.map((m) => (
            <StorageWarningBanner
              key={m.mailAccountId}
              email={`${m.username}@${domain.name}`}
              usedGB={m.usedBytes / BYTES_PER_GB}
              quotaGB={m.quotaBytes / BYTES_PER_GB}
              tier="warning"
            />
          ))}
        </div>
      )}

      {/* Greeting */}
      <div>
        <h1 className="text-[42px] font-bold tracking-tight text-foreground sm:text-[48px]">
          {ownerName
            ? t(`greeting.${getGreetingKey()}Named`, {
                name: ownerName.split(" ")[0],
              })
            : t(`greeting.${getGreetingKey()}`)}
        </h1>
        <p className="mt-2.5 flex items-start gap-2 text-base text-muted-foreground">
          {AdaptiveIcon && (
            <AdaptiveIcon
              className={cn("mt-0.5 size-5 shrink-0", adaptiveIconTone)}
              strokeWidth={1.75}
            />
          )}
          {adaptiveMessage}
        </p>
      </div>

      {/* Hero card: workspace profile */}
      <div className="mt-12 rounded-2xl border border-border bg-card p-7 shadow-[0_20px_48px_-28px_rgba(0,0,0,0.18)] sm:p-9">
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="lg:flex-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground/75">
              {t("hero.label")}
            </span>
            <h2 className="mt-1.5 text-[34px] font-semibold tracking-tight text-foreground sm:text-4xl">
              {domain.name}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[15px] font-medium text-muted-foreground">
              <span>{planName}</span>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1.5">
                <span
                  className={
                    domain.verified
                      ? "size-1.5 rounded-full bg-emerald-500"
                      : "size-1.5 rounded-full bg-amber-500"
                  }
                />
                {domain.verified ? t("hero.verified") : t("hero.verificationPending")}
              </span>
            </div>

            <TeamLoginLinkCompact
              domain={domain.name}
              copyLabel={tLink("copy")}
              copiedLabel={tLink("copied")}
            />

            <Link
              href="/dashboard/mail"
              className="mt-7 inline-flex items-center gap-2 rounded-full border border-primary/30 px-5 py-2.5 text-sm font-semibold text-primary transition-all duration-200 hover:gap-2.5 hover:border-primary/50 hover:bg-primary/10"
            >
              {t("hero.openMailbox")}
              <span aria-hidden>→</span>
            </Link>
          </div>

          <div className="flex flex-col justify-center border-t border-border/70 pt-6 lg:flex-1 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
            <StatList
              items={[
                { icon: Globe, label: t("hero.domains"), value: domainCount },
                { icon: Mail, label: t("hero.mailboxes"), value: mailAccounts.length },
                {
                  icon: PackageOpen,
                  label: t("hero.storageUsed"),
                  value: `${totalUsedGB.toFixed(0)} GB / ${totalQuotaGB.toFixed(0)} GB`,
                },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Create */}
      <div className="mt-12">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground/75">
          {t("create.title")}
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <LauncherAction
            icon={UserPlus}
            label={t("create.mailbox")}
            description={t("create.mailboxDescription")}
            href="/dashboard/mailboxes/add"
            tone="primary"
          />
          <LauncherAction
            icon={AtSign}
            label={t("create.roleEmail")}
            description={t("create.roleEmailDescription")}
            href="/dashboard/mailboxes#roles"
            tone="blue"
          />
          <LauncherAction
            icon={Globe}
            label={t("create.domain")}
            description={t("create.domainDescription")}
            href="/dashboard/domains"
            tone="emerald"
          />
          <LauncherAction
            icon={PackageOpen}
            label={t("create.storage")}
            description={t("create.storageDescription")}
            href="/dashboard/storage"
            tone="amber"
          />
        </div>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        {/* Workspace Health */}
        <div className="rounded-2xl border border-border bg-card p-7 sm:p-9">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground/75">
            {t("health.title")}
          </h2>
          <p className="mt-4 text-lg font-semibold text-foreground">
            {isHealthy ? t("health.allGood") : t("health.needsAttention")}
          </p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {isHealthy ? t("health.noAction") : issues.join(" · ")}
          </p>
          <ul className="mt-6 flex flex-col gap-3.5 border-t border-border/70 pt-6">
            {checklist.map((item, i) => (
              <li key={i} className="flex items-center gap-2.5 text-sm">
                <CheckCircle2
                  className={
                    item.ok
                      ? "size-4 shrink-0 text-emerald-600"
                      : "size-4 shrink-0 text-muted-foreground/40"
                  }
                  strokeWidth={1.5}
                />
                <span className={item.ok ? "text-foreground/85" : "text-muted-foreground"}>
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recently added mailboxes */}
        <div className="rounded-2xl border border-border bg-card p-7 sm:p-9">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground/75">
            {t("activity.title")}
          </h2>
          <div className="mt-5">
            {recentMailboxes.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("activity.empty")}</p>
            ) : (
              <ActivityTimeline
                groups={[
                  {
                    label: t("activity.recentMailboxes"),
                    items: recentMailboxes.map((account) => ({
                      id: String(account.id),
                      icon: Mail,
                      text: `${account.username}@${domain.name}`,
                      time: new Date(account.createdAt).toLocaleDateString(),
                    })),
                  },
                ]}
              />
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
