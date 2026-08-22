"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Languages, Sparkles, WandSparkles } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { DashboardShell } from "@/components/dashboard/shell";
import { useToast } from "@/components/dashboard/toast";
import { premiumButton } from "@/components/onboarding/styles";
import { cn } from "@/lib/utils";
import { getAiCreditsSummary } from "@/lib/onboarding";
import { listDomains } from "@/services/domain.services";
import { getProfile } from "@/services/auth.services";
import type { Domain, User } from "@/types";

const FEATURE_ICONS = {
  rewrite: WandSparkles,
  summarize: Sparkles,
  translate: Languages,
} as const;

export default function AiCreditsPage() {
  const t = useTranslations("Dashboard.aiCreditsPage");
  const router = useRouter();
  const { show } = useToast();
  const [domain, setDomain] = useState<Domain | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    (async () => {
      const [domains, user] = await Promise.all([listDomains(), getProfile()]);
      if (domains.length === 0) {
        router.replace("/onboarding");
        return;
      }
      setDomain(domains[0]);
      setProfile(user);
      setChecked(true);
    })();
  }, [router]);

  if (!checked || !domain) return null;

  const ownerName = profile ? `${profile.firstName} ${profile.lastName}`.trim() : "";
  const summary = getAiCreditsSummary();
  const remainingPct = Math.round((summary.remaining / summary.totalIncluded) * 100);

  return (
    <DashboardShell domain={domain.name} ownerName={ownerName}>
      <div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="flex items-center gap-2.5 text-3xl font-bold tracking-tight text-foreground">
            <Sparkles className="size-6 text-ai-accent" strokeWidth={1.5} />
            {t("title")}
          </h1>
          <Button
            className={cn(premiumButton)}
            onClick={() => show(t("purchaseComingSoon"), "info")}
          >
            {t("buyMore")}
          </Button>
        </div>
        <p className="mt-1.5 text-base text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card p-6 sm:p-8">
        <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
          <div className="flex items-center gap-5 rounded-2xl bg-ai-accent/5 p-5">
            <div
              className="flex size-20 shrink-0 items-center justify-center rounded-full"
              style={{
                background: `conic-gradient(var(--color-ai-accent) ${remainingPct * 3.6}deg, var(--color-muted) 0deg)`,
              }}
            >
              <div className="flex size-[68px] items-center justify-center rounded-full bg-card">
                <span className="text-sm font-bold text-ai-accent">{remainingPct}%</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground/75">
                {t("remaining")}
              </p>
              <p className="mt-1 text-3xl font-semibold tabular-nums text-foreground">
                {summary.remaining.toLocaleString()}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {t("ofTotal", { total: summary.totalIncluded.toLocaleString() })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 border-t border-border/70 pt-6 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground/75">
                {t("usedThisMonth")}
              </p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">
                {summary.usedThisMonth.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground/75">
                {t("estimatedRemaining")}
              </p>
              <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">
                {t("days", { count: summary.estimatedRemainingDays })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground/75">
          {t("mostUsedTitle")}
        </h2>
        <div className="mt-4 flex flex-col gap-2.5">
          {summary.mostUsedFeatures.map(({ feature, credits }) => {
            const Icon = FEATURE_ICONS[feature];
            const pct = Math.round((credits / summary.usedThisMonth) * 100);
            return (
              <div
                key={feature}
                className="flex items-center gap-3.5 rounded-2xl border border-border bg-card p-4"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-ai-accent/10 text-ai-accent">
                  <Icon className="size-4" strokeWidth={1.5} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-foreground/85">
                      {t(`features.${feature}`)}
                    </p>
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                      {t("creditsUsed", { credits: credits.toLocaleString(), percent: pct })}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted ring-1 ring-inset ring-border/50">
                    <div
                      className="h-full rounded-full bg-ai-accent"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardShell>
  );
}
