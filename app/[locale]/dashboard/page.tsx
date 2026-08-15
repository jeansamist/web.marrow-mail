"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  AtSign,
  CheckCircle2,
  Globe,
  Mail,
  PackageOpen,
  Rocket,
  TriangleAlert,
  UserCheck,
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
import {
  getMailboxStorageUsedGB,
  getMailboxesNeedingStorageAttention,
  getRecentActivity,
  getSubscriptionSummary,
  groupActivityByDay,
  loadAccount,
  type ActivityType,
  type OnboardingAccount,
} from "@/lib/onboarding";

const ACTIVITY_ICONS: Record<ActivityType, typeof Mail> = {
  mailboxCreated: Mail,
  invitationAccepted: UserCheck,
  roleCreated: AtSign,
  domainConnected: Globe,
  storagePurchased: PackageOpen,
};

function getGreetingKey(): "morning" | "afternoon" | "evening" {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}

export default function DashboardPage() {
  const t = useTranslations("Dashboard");
  const tLink = useTranslations("Dashboard.loginLink");
  const locale = useLocale();
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

  const pendingInvitations = account.mailboxes.filter(
    (m) => m.invitationStatus === "pending",
  ).length;
  const storageUsedGB = account.mailboxes.reduce(
    (sum, m) => sum + getMailboxStorageUsedGB(m),
    0,
  );
  const storagePurchasedGB = account.mailboxes.reduce(
    (sum, m) => sum + m.storagePurchasedGB,
    0,
  );
  const nearLimitCount = account.mailboxes.filter(
    (m) => getMailboxStorageUsedGB(m) / m.storagePurchasedGB > 0.8,
  ).length;
  const storageAttention = getMailboxesNeedingStorageAttention(account);
  const subscription = getSubscriptionSummary(account);
  const activity = getRecentActivity(account);
  const dayGroups = groupActivityByDay(activity, locale);
  const isHealthy = account.dnsVerified && pendingInvitations === 0 && nearLimitCount === 0;

  const issues: string[] = [];
  if (!account.dnsVerified) issues.push(t("health.domainsPending"));
  if (pendingInvitations > 0)
    issues.push(t("health.pendingInvites", { count: pendingInvitations }));
  if (nearLimitCount > 0)
    issues.push(t("health.storageNearLimit", { count: nearLimitCount }));

  const adaptiveMessage =
    account.mailboxes.length === 0
      ? t("adaptive.firstLogin")
      : !account.dnsVerified
        ? t("adaptive.domainNotVerified")
        : pendingInvitations > 0
          ? t("adaptive.pendingInvites", { count: pendingInvitations })
          : nearLimitCount > 0
            ? t("adaptive.lowStorage", { count: nearLimitCount })
            : t("adaptive.healthy");
  const AdaptiveIcon =
    account.mailboxes.length === 0
      ? Rocket
      : !account.dnsVerified
        ? TriangleAlert
        : pendingInvitations > 0
          ? UserPlus
          : nearLimitCount > 0
            ? TriangleAlert
            : null;
  const adaptiveIconTone =
    !account.dnsVerified || nearLimitCount > 0 ? "text-amber-600" : "text-primary";

  const checklist = [
    { ok: account.dnsVerified, label: t("health.domainVerified") },
    { ok: pendingInvitations === 0, label: t("health.mailboxesHealthy") },
    { ok: nearLimitCount === 0, label: t("health.storageAvailable") },
    { ok: true, label: t("health.aiCreditsAvailable") },
  ];

  const timelineGroups = dayGroups.map((group) => ({
    label:
      group.key === "today"
        ? t("activity.today")
        : group.key === "yesterday"
          ? t("activity.yesterday")
          : group.key,
    items: group.entries.map((entry) => ({
      id: entry.id,
      icon: ACTIVITY_ICONS[entry.type],
      text: t(`activity.${entry.type}`, { address: entry.address }),
      time: new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(entry.date)),
    })),
  }));

  return (
    <DashboardShell domain={account.domain} ownerName={account.ownerName}>
      {!account.dnsVerified && (
        <div className="mb-8 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
          <TriangleAlert className="mt-0.5 size-5 shrink-0 text-amber-700" strokeWidth={1.5} />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-900">
              {t("dnsIncompleteTitle")}
            </p>
            <p className="mt-1 text-sm text-amber-800/80">
              {t("dnsIncompleteDescription", { domain: account.domain })}
            </p>
          </div>
          <Button size="sm" asChild>
            <Link href="/onboarding">{t("finishDns")}</Link>
          </Button>
        </div>
      )}

      {(storageAttention.critical.length > 0 || storageAttention.warning.length > 0) && (
        <div className="mb-8 flex flex-col gap-3">
          {storageAttention.critical.map((mailbox) => (
            <StorageWarningBanner
              key={mailbox.id}
              mailbox={mailbox}
              domain={account.domain}
              tier="critical"
            />
          ))}
          {storageAttention.warning.map((mailbox) => (
            <StorageWarningBanner
              key={mailbox.id}
              mailbox={mailbox}
              domain={account.domain}
              tier="warning"
            />
          ))}
        </div>
      )}

      {/* Greeting */}
      <div>
        <h1 className="text-[42px] font-bold tracking-tight text-foreground sm:text-[48px]">
          {account.ownerName
            ? t(`greeting.${getGreetingKey()}Named`, {
                name: account.ownerName.split(" ")[0],
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
        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground/75">
              {t("hero.label")}
            </span>
            <h2 className="mt-1.5 text-[34px] font-semibold tracking-tight text-foreground sm:text-4xl">
              {account.domain}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[15px] font-medium text-muted-foreground">
              <span>{subscription.planName}</span>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1.5">
                <span
                  className={
                    account.dnsVerified
                      ? "size-1.5 rounded-full bg-emerald-500"
                      : "size-1.5 rounded-full bg-amber-500"
                  }
                />
                {account.dnsVerified ? t("hero.verified") : t("hero.verificationPending")}
              </span>
            </div>

            <TeamLoginLinkCompact
              domain={account.domain}
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

          <div className="border-t border-border/70 pt-6 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8">
            <StatList
              items={[
                { icon: Globe, label: t("hero.domains"), value: 1 },
                { icon: Mail, label: t("hero.mailboxes"), value: account.mailboxes.length },
                {
                  icon: PackageOpen,
                  label: t("hero.storageUsed"),
                  value: `${storageUsedGB.toFixed(0)} GB / ${storagePurchasedGB} GB`,
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

        {/* Activity */}
        <div className="rounded-2xl border border-border bg-card p-7 sm:p-9">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground/75">
            {t("activity.title")}
          </h2>
          <div className="mt-5">
            {timelineGroups.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("activity.empty")}</p>
            ) : (
              <ActivityTimeline groups={timelineGroups} />
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
