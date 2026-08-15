"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, Check } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";
import { MailboxSetupStep } from "@/components/onboarding/mailbox-setup-step";
import { PaymentStep } from "@/components/onboarding/payment-step";
import { cardShadow, premiumButton } from "@/components/onboarding/styles";
import { cn } from "@/lib/utils";
import {
  calcMailboxPricing,
  loadAccount,
  type BillingMonths,
  type Mailbox,
  type OnboardingAccount,
} from "@/lib/onboarding";
import { getProfile } from "@/services/auth.services";
import { setupMailAccount } from "@/services/onboarding.services";
import type { MailAccount } from "@/types";

export default function AddMailboxPage() {
  const t = useTranslations("Dashboard.addMailboxPage");
  const tMailboxes = useTranslations("Onboarding.mailboxes");
  const router = useRouter();
  const [account, setAccount] = useState<OnboardingAccount | null>(null);
  const [checked, setChecked] = useState(false);
  const [ownerEmail, setOwnerEmail] = useState<string | null>(null);
  const [step, setStep] = useState<"mailboxes" | "payment" | "success">("mailboxes");
  const [newMailboxes, setNewMailboxes] = useState<Mailbox[]>([]);
  const [createdAccounts, setCreatedAccounts] = useState<MailAccount[]>([]);
  const [months, setMonths] = useState<BillingMonths>(1);
  const [creationError, setCreationError] = useState<string | null>(null);

  useEffect(() => {
    const stored = loadAccount();
    if (!stored) {
      router.replace("/onboarding");
      return;
    }
    setAccount(stored);
    setChecked(true);
  }, [router]);

  useEffect(() => {
    getProfile().then((profile) => setOwnerEmail(profile?.email ?? null));
  }, []);

  if (!checked || !account) return null;

  async function handlePaid(): Promise<boolean> {
    if (!account) return false;
    setCreationError(null);

    const created = await setupMailAccount(
      {
        data: newMailboxes.map((mailbox) => ({
          username: mailbox.username,
          owner: mailbox.assignedTo || ownerEmail || "",
        })),
      },
      account.domain,
    );

    if (created instanceof Error) {
      setCreationError(t("creationError"));
      return false;
    }

    setCreatedAccounts(created);
    return true;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/70">
        <div className="container flex h-16 items-center justify-between">
          <Link
            href="/dashboard/mailboxes"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            {t("back")}
          </Link>
          <Link href="/">
            <Logo className="h-7 w-auto text-foreground" />
          </Link>
          <span className="w-16" aria-hidden />
        </div>
      </header>

      <main className="container flex min-h-[calc(100vh-65px)] items-center justify-center py-12">
        <div
          className={`w-full max-w-xl rounded-2xl border border-border bg-card p-8 sm:p-10 ${cardShadow}`}
        >
          {step === "mailboxes" && (
            <MailboxSetupStep
              domain={account.domain}
              plan={account.plan}
              initialMailboxes={[]}
              initialBillingMonths={months}
              onContinue={(list, selectedMonths) => {
                setNewMailboxes(list);
                setMonths(selectedMonths);
                setStep("payment");
              }}
            />
          )}

          {step === "payment" && (
            <>
              <PaymentStep
                variant="mailbox"
                plan={account.plan}
                mailboxQuantity={newMailboxes.length}
                billingMonths={months}
                lineItems={[
                  {
                    label: tMailboxes("summaryLine", {
                      count: newMailboxes.length,
                      months,
                    }),
                    amount: calcMailboxPricing(newMailboxes.length, months, account.plan).total,
                  },
                ]}
                onPaid={async () => {
                  const created = await handlePaid();
                  if (created) setStep("success");
                }}
              />
              {creationError && (
                <p className="mt-4 text-center text-sm text-destructive">{creationError}</p>
              )}
            </>
          )}

          {step === "success" && (
            <div className="flex flex-col items-center text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Check className="size-7" strokeWidth={2} />
              </span>
              <h1 className="mt-6 text-xl font-bold text-foreground">
                {t("success.title")}
              </h1>
              <div className="mt-4 w-full rounded-xl border border-border bg-muted/30 p-4 text-left">
                <ul className="flex flex-col gap-2">
                  {createdAccounts.map((m) => (
                    <li key={m.id} className="text-sm">
                      <span className="font-medium text-foreground">
                        {m.username}@{account.domain}
                      </span>
                      {m.ownerEmail && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {t("success.invitationSent", { assignedTo: m.ownerEmail })}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-6 flex w-full flex-col gap-2.5">
                <Button
                  className={cn("w-full", premiumButton)}
                  onClick={() => {
                    setNewMailboxes([]);
                    setStep("mailboxes");
                  }}
                >
                  {t("success.createAnother")}
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/dashboard/mailboxes">{t("success.viewMailboxes")}</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
