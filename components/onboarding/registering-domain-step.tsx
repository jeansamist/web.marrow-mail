"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { premiumButton } from "@/components/onboarding/styles";

export function RegisteringDomainStep({
  domain,
  onDone,
}: {
  domain: string;
  onDone: () => void;
}) {
  const t = useTranslations("Onboarding.registeringDomain");
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setRegistered(true), 1800);
    return () => clearTimeout(timer);
  }, []);

  if (registered) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <div className="relative">
          <div
            aria-hidden
            className="absolute -inset-6 -z-10 rounded-full bg-secondary/20 blur-2xl"
          />
          <span className="flex size-14 items-center justify-center rounded-full bg-secondary/10 text-secondary">
            <Check className="size-7" strokeWidth={2} />
          </span>
        </div>
        <h1 className="mt-6 text-xl font-bold text-foreground">
          {t("successTitle", { domain })}
        </h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {t("successDescription")}
        </p>
        <Button size="lg" className={cn("mt-8 w-full", premiumButton)} onClick={onDone}>
          {t("continueCta")}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-12 text-center">
      <Loader2 className="size-8 animate-spin text-primary" strokeWidth={1.5} />
      <h1 className="mt-6 text-xl font-bold text-foreground">
        {t("title", { domain })}
      </h1>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {t("description")}
      </p>
    </div>
  );
}
