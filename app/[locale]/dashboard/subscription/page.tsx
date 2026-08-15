"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, HardDrive, Mic, PackageOpen, Plus, Sparkles, TriangleAlert } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { DashboardShell } from "@/components/dashboard/shell";
import { useToast } from "@/components/dashboard/toast";
import { premiumButton, softShadow } from "@/components/onboarding/styles";
import { cn } from "@/lib/utils";
import {
  PLANS,
  formatXaf,
  getSubscriptionSummary,
  loadAccount,
  saveAccount,
  type OnboardingAccount,
  type PlanId,
} from "@/lib/onboarding";

const PLAN_ORDER: PlanId[] = ["core", "plus"];

export default function SubscriptionPage() {
  const t = useTranslations("Dashboard.subscriptionPage");
  const tPlan = useTranslations("Onboarding.plan");
  const locale = useLocale();
  const router = useRouter();
  const { show } = useToast();
  const [account, setAccount] = useState<OnboardingAccount | null>(null);
  const [checked, setChecked] = useState(false);

  const [downgradeTarget, setDowngradeTarget] = useState<PlanId | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

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

  function applyPlanSwitch(planId: PlanId) {
    if (!account) return;
    const next: OnboardingAccount = { ...account, plan: planId };
    saveAccount(next);
    setAccount(next);
    show(t("planChanged", { plan: PLANS[planId].name }), "success");
  }

  function handleSwitchPlan(planId: PlanId) {
    if (!account || planId === account.plan) return;
    const target = PLANS[planId];
    const losesRoleAliases = account.roleAliases.length > target.roleAliasLimit;
    const losesVoiceNotes = PLANS[account.plan].voiceNotes && !target.voiceNotes;
    if (losesRoleAliases || losesVoiceNotes) {
      setDowngradeTarget(planId);
      return;
    }
    applyPlanSwitch(planId);
  }

  function handleCancelSubscription() {
    if (!account) return;
    const next: OnboardingAccount = { ...account, subscriptionStatus: "canceled" };
    saveAccount(next);
    setAccount(next);
    setCancelModalOpen(false);
    show(t("subscriptionCanceled"), "info");
  }

  function handleReactivate() {
    if (!account) return;
    const next: OnboardingAccount = { ...account, subscriptionStatus: "active" };
    saveAccount(next);
    setAccount(next);
    show(t("reactivated"), "success");
  }

  const summary = getSubscriptionSummary(account);
  const dateFormatter = new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const rows = [
    { label: t("currentPlan"), value: summary.planName },
    {
      label: t("monthlyCost"),
      value: formatXaf(summary.monthlyCostXaf, locale),
      helper: t("costBreakdown", {
        count: summary.mailboxCount,
        price: formatXaf(summary.perMailboxXaf, locale),
      }),
    },
    { label: t("renewalDate"), value: dateFormatter.format(new Date(summary.renewalDate)) },
    { label: t("mailboxesLabel"), value: t("mailboxCount", { count: summary.mailboxCount }) },
    { label: t("workspaceStorage"), value: `${summary.workspaceStorageGB} GB` },
    { label: t("includedAiCredits"), value: summary.includedAiCredits.toLocaleString() },
  ];
  const renewalDateFormatted = dateFormatter.format(new Date(summary.renewalDate));
  const downgradePlan = downgradeTarget ? PLANS[downgradeTarget] : null;

  return (
    <DashboardShell domain={account.domain} ownerName={account.ownerName}>
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {t("title")}
        </h1>
        <p className="mt-1.5 text-base text-muted-foreground">{t("subtitle")}</p>
      </div>

      {account.subscriptionStatus === "canceled" && (
        <div className="mt-6 flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2.5 text-sm text-amber-800">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" strokeWidth={1.5} />
            {t("canceledBanner", { date: renewalDateFormatted })}
          </p>
          <Button size="sm" variant="outline" className="shrink-0" onClick={handleReactivate}>
            {t("reactivate")}
          </Button>
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-border bg-card p-6 sm:p-8">
        <dl className="divide-y divide-border/70">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-4 py-4 text-sm">
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd className="text-right">
                <span className="font-semibold text-foreground">{row.value}</span>
                {"helper" in row && row.helper && (
                  <p className="mt-0.5 text-xs font-normal text-muted-foreground">
                    {row.helper}
                  </p>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-semibold text-foreground">{t("yourPlan")}</h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {PLAN_ORDER.map((planId) => {
            const plan = PLANS[planId];
            const isCurrent = account.plan === planId;
            return (
              <div
                key={planId}
                className={cn(
                  "relative flex flex-col items-start rounded-xl border p-5",
                  isCurrent ? cn("border-primary bg-accent/40", softShadow) : "border-border bg-card",
                )}
              >
                {isCurrent && (
                  <span className="absolute -top-2.5 right-4 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                    {t("currentPlanBadge")}
                  </span>
                )}
                <span className="text-sm font-semibold text-foreground">{plan.name}</span>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="font-mono text-xl font-semibold tracking-tight text-foreground">
                    {formatXaf(plan.priceXaf, locale)}
                  </span>
                  <span className="text-xs text-muted-foreground">{tPlan("priceSuffix")}</span>
                </div>
                <ul className="mt-3 flex flex-col gap-2">
                  <li className="flex items-start gap-2 text-sm text-foreground/85">
                    <HardDrive className="mt-0.5 size-3.5 shrink-0 text-primary" strokeWidth={2} />
                    {tPlan("storage", { gb: plan.storageGB })}
                  </li>
                  <li className="flex items-start gap-2 text-sm text-foreground/85">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-primary" strokeWidth={2.5} />
                    {tPlan("roleAliases", { count: plan.roleAliasLimit })}
                  </li>
                  {plan.voiceNotes && (
                    <li className="flex items-start gap-2 text-sm font-medium text-secondary">
                      <Mic className="mt-0.5 size-3.5 shrink-0" strokeWidth={2} />
                      {tPlan("voiceNotes")}
                    </li>
                  )}
                </ul>
                {!isCurrent && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-4 w-full"
                    onClick={() => handleSwitchPlan(planId)}
                  >
                    {t("switchTo", { plan: plan.name })}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Button className={cn(premiumButton)} asChild>
          <Link href="/dashboard/mailboxes/add">
            <Plus className="size-4" strokeWidth={1.5} />
            {t("addMailbox")}
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard/storage">
            <PackageOpen className="size-4" strokeWidth={1.5} />
            {t("buyStorage")}
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard/ai-credits">
            <Sparkles className="size-4 text-ai-accent" strokeWidth={1.5} />
            {t("buyAiCredits")}
          </Link>
        </Button>
      </div>

      {account.subscriptionStatus === "active" && (
        <div className="mt-10 rounded-2xl border border-destructive/20 bg-destructive/5 p-6 sm:p-8">
          <h2 className="text-sm font-semibold text-destructive">{t("dangerZoneTitle")}</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">{t("dangerZoneDescription")}</p>
          <Button
            variant="outline"
            className="mt-4 border-destructive/30 text-destructive hover:bg-destructive/10"
            onClick={() => setCancelModalOpen(true)}
          >
            {t("cancelSubscription")}
          </Button>
        </div>
      )}

      {downgradePlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            aria-hidden
            onClick={() => setDowngradeTarget(null)}
            className="absolute inset-0 bg-black/30"
          />
          <div className={cn("relative w-full max-w-md rounded-2xl border border-border bg-card p-6", softShadow)}>
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
                <TriangleAlert className="size-5" strokeWidth={1.5} />
              </span>
              <div>
                <h2 className="text-base font-bold text-foreground">
                  {t("downgradeModalTitle", { plan: downgradePlan.name })}
                </h2>
                <ul className="mt-2 flex flex-col gap-1.5 text-sm text-muted-foreground">
                  {account.roleAliases.length > downgradePlan.roleAliasLimit && (
                    <li>
                      {t("downgradeModalRoleAliasWarning", {
                        plan: downgradePlan.name,
                        limit: downgradePlan.roleAliasLimit,
                        count: account.roleAliases.length,
                      })}
                    </li>
                  )}
                  {PLANS[account.plan].voiceNotes && !downgradePlan.voiceNotes && (
                    <li>{t("downgradeModalVoiceNotesWarning")}</li>
                  )}
                </ul>
              </div>
            </div>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => setDowngradeTarget(null)}>
                {t("downgradeModalCancel")}
              </Button>
              <Button
                className="border-destructive/30 text-destructive hover:bg-destructive/10"
                variant="outline"
                onClick={() => {
                  applyPlanSwitch(downgradeTarget!);
                  setDowngradeTarget(null);
                }}
              >
                {t("downgradeModalConfirm")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            aria-hidden
            onClick={() => setCancelModalOpen(false)}
            className="absolute inset-0 bg-black/30"
          />
          <div className={cn("relative w-full max-w-md rounded-2xl border border-border bg-card p-6", softShadow)}>
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <TriangleAlert className="size-5" strokeWidth={1.5} />
              </span>
              <div>
                <h2 className="text-base font-bold text-foreground">{t("cancelModalTitle")}</h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {t("cancelModalDescription", { date: renewalDateFormatted })}
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => setCancelModalOpen(false)}>
                {t("cancelModalKeep")}
              </Button>
              <Button
                className="border-destructive/30 text-destructive hover:bg-destructive/10"
                variant="outline"
                onClick={handleCancelSubscription}
              >
                {t("cancelModalConfirm")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
