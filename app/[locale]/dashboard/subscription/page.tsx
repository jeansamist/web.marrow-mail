"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, HardDrive, Mic, PackageOpen, Plus, Sparkles, TriangleAlert } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { DashboardShell } from "@/components/dashboard/shell";
import { useToast } from "@/components/dashboard/toast";
import { PaymentStep } from "@/components/onboarding/payment-step";
import { premiumButton, softShadow } from "@/components/onboarding/styles";
import { cn } from "@/lib/utils";
import { PLANS, calcMailboxPricing, formatXaf, type PlanId } from "@/lib/onboarding";
import { listDomains } from "@/services/domain.services";
import { listRoleAliases } from "@/services/role-alias.services";
import { getProfile } from "@/services/auth.services";
import {
  cancelSubscription,
  changeSubscriptionPlan,
  getCurrentSubscription,
  reactivateSubscription,
} from "@/services/subscription.services";
import type { Domain, Subscription } from "@/types";

const PLAN_ORDER: PlanId[] = ["core", "plus"];

export default function SubscriptionPage() {
  const t = useTranslations("Dashboard.subscriptionPage");
  const tPlan = useTranslations("Onboarding.plan");
  const locale = useLocale();
  const router = useRouter();
  const { show } = useToast();

  const [checked, setChecked] = useState(false);
  const [domain, setDomain] = useState<Domain | null>(null);
  const [ownerName, setOwnerName] = useState("");
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [roleAliasCount, setRoleAliasCount] = useState(0);

  const [downgradeTarget, setDowngradeTarget] = useState<PlanId | null>(null);
  const [downgradePassword, setDowngradePassword] = useState("");
  const [downgradePasswordError, setDowngradePasswordError] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [upgradeTarget, setUpgradeTarget] = useState<PlanId | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [reactivating, setReactivating] = useState(false);

  useEffect(() => {
    (async () => {
      const [domains, currentSubscription, profile] = await Promise.all([
        listDomains(),
        getCurrentSubscription(),
        getProfile(),
      ]);
      if (domains.length === 0) {
        router.replace("/onboarding");
        return;
      }
      const primaryDomain = domains[0];
      setDomain(primaryDomain);
      setSubscription(currentSubscription);
      setOwnerName(profile ? `${profile.firstName} ${profile.lastName}`.trim() : "");
      setRoleAliasCount((await listRoleAliases(primaryDomain.id)).length);
      setChecked(true);
    })();
  }, [router]);

  if (!checked || !domain) return null;

  function isUpgrade(planId: PlanId) {
    if (!subscription) return false;
    return PLANS[planId].priceXaf > PLANS[subscription.planId as PlanId].priceXaf;
  }

  function handleSwitchPlan(planId: PlanId) {
    if (!subscription || planId === subscription.planId || subscription.pendingPlanId) return;
    if (isUpgrade(planId)) {
      setUpgradeTarget(planId);
      return;
    }
    setDowngradeTarget(planId);
  }

  async function submitDowngrade() {
    if (!subscription || !downgradeTarget) return;
    setScheduling(true);
    setDowngradePasswordError(false);
    const result = await changeSubscriptionPlan(
      subscription.id,
      downgradeTarget,
      downgradePassword,
    );
    setScheduling(false);
    if (result instanceof Error) {
      setDowngradePasswordError(true);
      return;
    }
    setSubscription(result);
    show(
      t("downgradeScheduled", {
        plan: PLANS[downgradeTarget].name,
        date: renewalDateFormatted ?? "—",
      }),
      "info",
    );
    setDowngradeTarget(null);
    setDowngradePassword("");
  }

  function handleUpgradePaid() {
    setUpgradeTarget(null);
    (async () => {
      const updated = await getCurrentSubscription();
      if (updated) setSubscription(updated);
    })();
    if (upgradeTarget) show(t("planChanged", { plan: PLANS[upgradeTarget].name }), "success");
  }

  async function handleCancelSubscription() {
    if (!subscription) return;
    setCanceling(true);
    const updated = await cancelSubscription(subscription.id);
    setCanceling(false);
    setCancelModalOpen(false);
    if (!updated) {
      show(t("cancelFailed"), "error");
      return;
    }
    setSubscription(updated);
    show(t("subscriptionCanceled"), "info");
  }

  async function handleReactivate() {
    if (!subscription) return;
    setReactivating(true);
    const updated = await reactivateSubscription(subscription.id);
    setReactivating(false);
    if (!updated) {
      show(t("reactivateFailed"), "error");
      return;
    }
    setSubscription(updated);
    show(t("reactivated"), "success");
  }

  const dateFormatter = new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const perMonthTotal = subscription ? subscription.amountTotal / subscription.billingMonths : 0;
  const perMailboxPerMonth =
    subscription && subscription.mailboxQuantity > 0
      ? perMonthTotal / subscription.mailboxQuantity
      : 0;
  const renewalDateFormatted = subscription?.currentPeriodEnd
    ? dateFormatter.format(new Date(subscription.currentPeriodEnd))
    : null;

  const rows = subscription
    ? [
        { label: t("currentPlan"), value: PLANS[subscription.planId as PlanId].name },
        {
          label: t("monthlyCost"),
          value: formatXaf(perMonthTotal, locale),
          helper: t("costBreakdown", {
            count: subscription.mailboxQuantity,
            price: formatXaf(perMailboxPerMonth, locale),
          }),
        },
        ...(renewalDateFormatted
          ? [{ label: t("renewalDate"), value: renewalDateFormatted }]
          : []),
        {
          label: t("mailboxesLabel"),
          value: t("mailboxCount", { count: subscription.mailboxQuantity }),
        },
        {
          label: t("workspaceStorage"),
          value: `${PLANS[subscription.planId as PlanId].storageGB * subscription.mailboxQuantity} GB`,
        },
      ]
    : [];
  const downgradePlan = downgradeTarget ? PLANS[downgradeTarget] : null;

  return (
    <DashboardShell domain={domain.name} ownerName={ownerName}>
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {t("title")}
        </h1>
        <p className="mt-1.5 text-base text-muted-foreground">{t("subtitle")}</p>
      </div>

      {subscription?.status === "canceled" && renewalDateFormatted && (
        <div className="mt-6 flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2.5 text-sm text-amber-800">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" strokeWidth={1.5} />
            {t("canceledBanner", { date: renewalDateFormatted })}
          </p>
          <Button
            size="sm"
            variant="outline"
            className="shrink-0"
            disabled={reactivating}
            onClick={handleReactivate}
          >
            {reactivating ? t("reactivating") : t("reactivate")}
          </Button>
        </div>
      )}

      {subscription?.pendingPlanId && (
        <div className="mt-6 flex flex-col gap-3 rounded-xl border border-primary/25 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2.5 text-sm text-foreground">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-primary" strokeWidth={1.5} />
            {isUpgrade(subscription.pendingPlanId)
              ? t("pendingUpgradeBanner", { plan: PLANS[subscription.pendingPlanId].name })
              : t("pendingDowngradeBanner", {
                  plan: PLANS[subscription.pendingPlanId].name,
                  date: renewalDateFormatted ?? "—",
                })}
          </p>
          {isUpgrade(subscription.pendingPlanId) && (
            <Button
              size="sm"
              variant="outline"
              className="shrink-0"
              onClick={() => setUpgradeTarget(subscription.pendingPlanId as PlanId)}
            >
              {t("pendingUpgradeResume")}
            </Button>
          )}
        </div>
      )}

      {!subscription ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">{t("noSubscription")}</p>
        </div>
      ) : (
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
      )}

      <div className="mt-8">
        <h2 className="text-sm font-semibold text-foreground">{t("yourPlan")}</h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {PLAN_ORDER.map((planId) => {
            const plan = PLANS[planId];
            const isCurrent = subscription?.planId === planId;
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
                {subscription && !isCurrent && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-4 w-full"
                    disabled={!!subscription.pendingPlanId}
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

      {subscription?.status === "active" && (
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

      {downgradePlan && subscription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            aria-hidden
            onClick={() => {
              setDowngradeTarget(null);
              setDowngradePassword("");
              setDowngradePasswordError(false);
            }}
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
                  <li>
                    {t("downgradeModalScheduledNote", {
                      plan: downgradePlan.name,
                      date: renewalDateFormatted ?? "—",
                    })}
                  </li>
                  {roleAliasCount > downgradePlan.roleAliasLimit && (
                    <li>
                      {t("downgradeModalRoleAliasWarning", {
                        plan: downgradePlan.name,
                        limit: downgradePlan.roleAliasLimit,
                        count: roleAliasCount,
                      })}
                    </li>
                  )}
                  {PLANS[subscription.planId as PlanId].voiceNotes && !downgradePlan.voiceNotes && (
                    <li>{t("downgradeModalVoiceNotesWarning")}</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="mt-4">
              <label className="text-xs font-medium text-muted-foreground">
                {t("downgradeModalPasswordLabel")}
              </label>
              <input
                type="password"
                value={downgradePassword}
                onChange={(e) => {
                  setDowngradePassword(e.target.value);
                  setDowngradePasswordError(false);
                }}
                placeholder={t("downgradeModalPasswordPlaceholder")}
                className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-50 outline-none transition-all duration-200 placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              {downgradePasswordError && (
                <p className="mt-1.5 text-xs text-destructive">
                  {t("downgradeModalWrongPassword")}
                </p>
              )}
            </div>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setDowngradeTarget(null);
                  setDowngradePassword("");
                  setDowngradePasswordError(false);
                }}
              >
                {t("downgradeModalCancel")}
              </Button>
              <Button
                className="border-destructive/30 text-destructive hover:bg-destructive/10"
                variant="outline"
                disabled={scheduling || !downgradePassword}
                onClick={submitDowngrade}
              >
                {scheduling ? t("switching") : t("downgradeModalConfirm")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {upgradeTarget && subscription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            aria-hidden
            onClick={() => setUpgradeTarget(null)}
            className="absolute inset-0 bg-black/30"
          />
          <div
            className={cn(
              "relative w-full max-w-md rounded-2xl border border-border bg-card p-6",
              softShadow,
            )}
          >
            <PaymentStep
              variant="upgrade"
              subscriptionId={subscription.id}
              plan={upgradeTarget}
              lineItems={[
                {
                  label: t("upgradeLineItem", { plan: PLANS[upgradeTarget].name }),
                  amount: calcMailboxPricing(
                    subscription.mailboxQuantity,
                    subscription.billingMonths,
                    upgradeTarget,
                  ).total,
                },
              ]}
              onPaid={handleUpgradePaid}
            />
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
                  {t("cancelModalDescription", { date: renewalDateFormatted ?? "—" })}
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
                disabled={canceling}
                onClick={handleCancelSubscription}
              >
                {canceling ? t("canceling") : t("cancelModalConfirm")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
