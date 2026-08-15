"use client";

import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Mailbox } from "@/lib/onboarding";
import { premiumButton, softShadow } from "@/components/onboarding/styles";

export function SuccessStep({
  domain,
  mailboxes,
}: {
  domain: string;
  mailboxes: Mailbox[];
}) {
  const t = useTranslations("Onboarding.success");

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative">
        <div
          aria-hidden
          className="absolute -inset-6 -z-10 rounded-full bg-secondary/20 blur-2xl"
        />
        <span className="flex size-14 items-center justify-center rounded-full bg-secondary/10 text-secondary">
          <Check className="size-7" strokeWidth={2} />
        </span>
      </div>
      <h1 className="mt-6 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {t("title")}
      </h1>
      <p className="mt-2 max-w-sm text-muted-foreground">
        {t("description", { domain })}
      </p>

      <div className={cn("mt-8 w-full rounded-xl border border-border bg-card p-5 text-left", softShadow)}>
        <p className="font-mono text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
          {t("mailboxesLabel")}
        </p>
        <ul className="mt-3 flex flex-col gap-2.5">
          {mailboxes.map((mailbox) => (
            <li key={mailbox.id} className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">
                {mailbox.username}@{domain}
              </span>
              <span className="truncate pl-3 text-muted-foreground">
                {mailbox.assignedTo ?? t("unassigned")}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <Button size="lg" className={cn("mt-8 w-full", premiumButton)} asChild>
        <Link href="/dashboard">{t("cta")}</Link>
      </Button>
    </div>
  );
}
