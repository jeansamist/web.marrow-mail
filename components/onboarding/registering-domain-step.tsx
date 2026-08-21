"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Loader2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { premiumButton } from "@/components/onboarding/styles";
import { getDomainRegistrationStatus } from "@/services/domain-purchase.services";

const POLL_INTERVAL_MS = 5000;
// AWS domain registration can take several minutes — after this many polls
// (~1 minute), let the user move on instead of blocking on a spinner; the
// backend keeps provisioning DNS in the background regardless.
const OFFER_CONTINUE_AFTER_ATTEMPTS = 12;

export function RegisteringDomainStep({
  domain,
  onDone,
}: {
  domain: string;
  onDone: () => void;
}) {
  const t = useTranslations("Onboarding.registeringDomain");
  const [status, setStatus] = useState<"pending" | "registered" | "failed">("pending");
  const [canContinueAnyway, setCanContinueAnyway] = useState(false);
  const attemptsRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    const interval = setInterval(async () => {
      attemptsRef.current += 1;
      const resp = await getDomainRegistrationStatus(domain);
      if (cancelled) return;

      if (!(resp instanceof Error)) {
        if (resp.registrationStatus === "registered") {
          setStatus("registered");
          clearInterval(interval);
          return;
        }
        if (resp.registrationStatus === "failed") {
          setStatus("failed");
          clearInterval(interval);
          return;
        }
      }

      if (attemptsRef.current >= OFFER_CONTINUE_AFTER_ATTEMPTS) {
        setCanContinueAnyway(true);
      }
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [domain]);

  if (status === "failed") {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <TriangleAlert className="size-7" strokeWidth={2} />
        </span>
        <h1 className="mt-6 text-xl font-bold text-foreground">{t("failedTitle")}</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">{t("failedDescription")}</p>
      </div>
    );
  }

  if (status === "registered") {
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
      {canContinueAnyway && (
        <>
          <p className="mt-4 max-w-sm text-xs text-muted-foreground">
            {t("stillWorkingDescription")}
          </p>
          <Button
            variant="outline"
            size="lg"
            className="mt-4 w-full"
            onClick={onDone}
          >
            {t("continueAnywayCta")}
          </Button>
        </>
      )}
    </div>
  );
}
