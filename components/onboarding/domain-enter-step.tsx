"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Globe, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { premiumButton } from "@/components/onboarding/styles";
import { onboardingRegisterDomainSchema } from "@/schemas/onboarding.schemas";
import { registerDomain } from "@/services/onboarding.services";
import { getErrorStatus } from "@/lib/api-error";

const DOMAIN_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.[a-z]{2,}$/i;

export function DomainEnterStep({
  initialValue,
  onContinue,
}: {
  initialValue: string;
  onContinue: (domain: string) => void;
}) {
  const t = useTranslations("Onboarding.domainEnter");
  const [domain, setDomain] = useState(initialValue);
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmed = domain.trim().toLowerCase();
  const isValid = DOMAIN_PATTERN.test(trimmed);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    setError(null);
    if (!isValid) return;

    const parsed = onboardingRegisterDomainSchema.safeParse({ name: trimmed });
    if (!parsed.success) return;

    setSubmitting(true);
    const resp = await registerDomain(parsed.data);
    setSubmitting(false);

    if (resp instanceof Error) {
      setError(getErrorStatus(resp) === 409 ? t("domainTakenError") : t("registerError"));
      return;
    }

    onContinue(trimmed);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {t("title")}
      </h1>
      <p className="mt-2 text-muted-foreground">{t("description")}</p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-2">
        <label htmlFor="domain" className="text-sm font-medium text-foreground">
          {t("label")}
        </label>
        <div className="relative">
          <Globe
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.5}
          />
          <Input
            id="domain"
            name="domain"
            autoFocus
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder={t("placeholder")}
            className="rounded-xl pl-10"
          />
        </div>
        {touched && !isValid && (
          <p className="text-sm text-destructive">{t("error")}</p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button
          type="submit"
          size="lg"
          className={cn("mt-6 w-full", premiumButton)}
          disabled={!isValid || submitting}
        >
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" strokeWidth={1.5} />
              {t("submitting")}
            </>
          ) : (
            t("continue")
          )}
        </Button>
      </form>
    </div>
  );
}
