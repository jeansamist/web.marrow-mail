"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Globe, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { premiumButton, softShadow } from "@/components/onboarding/styles";

export function DomainChoiceStep({
  initialValue,
  onContinue,
}: {
  initialValue: boolean | null;
  onContinue: (hasDomain: boolean) => void;
}) {
  const t = useTranslations("Onboarding.choice");
  const [selected, setSelected] = useState<boolean | null>(initialValue);

  const options: { value: boolean; icon: typeof Globe; title: string; description: string }[] = [
    {
      value: true,
      icon: Globe,
      title: t("yesTitle"),
      description: t("yesDescription"),
    },
    {
      value: false,
      icon: Search,
      title: t("noTitle"),
      description: t("noDescription"),
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {t("title")}
      </h1>
      <p className="mt-2 text-muted-foreground">{t("description")}</p>

      <div className="mt-8 flex flex-col gap-3">
        {options.map(({ value, icon: Icon, title, description }) => (
          <button
            key={title}
            type="button"
            onClick={() => setSelected(value)}
            style={selected === value ? { borderColor: "var(--primary)" } : undefined}
            className={cn(
              "flex items-start gap-4 rounded-xl border p-5 text-left transition-all duration-300 ease-out",
              selected === value
                ? cn("bg-accent/40 ring-2 ring-primary/15", softShadow)
                : "border-border bg-card hover:-translate-y-1 hover:border-primary/30 hover:shadow-md",
            )}
          >
            <span
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-full",
                selected === value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              <Icon className="size-4" strokeWidth={1.5} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground">{title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </div>
            {selected === value && (
              <span className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="size-3" strokeWidth={2} />
              </span>
            )}
          </button>
        ))}
      </div>

      <Button
        size="lg"
        className={cn("mt-8 w-full", premiumButton)}
        disabled={selected === null}
        onClick={() => selected !== null && onContinue(selected)}
      >
        {t("continue")}
      </Button>
    </div>
  );
}
