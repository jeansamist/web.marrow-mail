"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, HardDrive, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PLANS, formatXaf, type PlanId } from "@/lib/onboarding";
import { premiumButton, softShadow } from "@/components/onboarding/styles";

const PLAN_ORDER: PlanId[] = ["core", "plus"];

export function PlanSelectStep({
  initialValue,
  onContinue,
}: {
  initialValue: PlanId;
  onContinue: (plan: PlanId) => void;
}) {
  const t = useTranslations("Onboarding.plan");
  const locale = useLocale();
  const [selected, setSelected] = useState<PlanId>(initialValue);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {t("title")}
      </h1>
      <p className="mt-2 text-muted-foreground">{t("description")}</p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {PLAN_ORDER.map((planId) => {
          const plan = PLANS[planId];
          const isSelected = selected === planId;
          return (
            <button
              key={planId}
              type="button"
              onClick={() => setSelected(planId)}
              style={isSelected ? { borderColor: "var(--primary)" } : undefined}
              className={cn(
                "relative flex flex-col items-start rounded-xl border p-5 text-left transition-all duration-300 ease-out",
                isSelected
                  ? cn("bg-accent/40 ring-2 ring-primary/15", softShadow)
                  : "border-border bg-card hover:-translate-y-1 hover:border-primary/30 hover:shadow-md",
              )}
            >
              {planId === "plus" && (
                <span className="absolute -top-2.5 right-4 rounded-full bg-[#FBB02D] px-2.5 py-0.5 text-[10px] font-semibold text-slate-900">
                  {t("popularBadge")}
                </span>
              )}
              <span className="text-sm font-semibold text-foreground">
                {t(`${planId}Name`)}
              </span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-mono text-2xl font-semibold tracking-tight text-foreground">
                  {formatXaf(plan.priceXaf, locale)}
                </span>
                <span className="text-xs text-muted-foreground">{t("priceSuffix")}</span>
              </div>

              <ul className="mt-4 flex flex-col gap-2.5">
                <li className="flex items-start gap-2 text-sm text-foreground/85">
                  <HardDrive className="mt-0.5 size-3.5 shrink-0 text-primary" strokeWidth={2} />
                  {t("storage", { gb: plan.storageGB })}
                </li>
                <li className="flex items-start gap-2 text-sm text-foreground/85">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-primary" strokeWidth={2.5} />
                  {t("roleAliases", { count: plan.roleAliasLimit })}
                </li>
                {plan.voiceNotes && (
                  <li className="flex items-start gap-2 text-sm font-medium text-secondary">
                    <Mic className="mt-0.5 size-3.5 shrink-0" strokeWidth={2} />
                    {t("voiceNotes")}
                  </li>
                )}
              </ul>

              <span
                className={cn(
                  "mt-4 flex size-5 items-center justify-center rounded-full border",
                  isSelected ? "border-primary bg-primary text-primary-foreground" : "border-border",
                )}
              >
                {isSelected && <Check className="size-3" strokeWidth={2.5} />}
              </span>
            </button>
          );
        })}
      </div>

      <Button
        size="lg"
        className={cn("mt-8 w-full", premiumButton)}
        onClick={() => onContinue(selected)}
      >
        {t("continue")}
      </Button>
    </div>
  );
}
