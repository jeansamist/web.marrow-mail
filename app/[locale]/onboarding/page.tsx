"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { DomainChoiceStep } from "@/components/onboarding/domain-choice-step";
import { DomainEnterStep } from "@/components/onboarding/domain-enter-step";
import { DomainSearchStep } from "@/components/onboarding/domain-search-step";
import { RegistrantContactStep } from "@/components/onboarding/registrant-contact-step";
import { MailboxSetupStep } from "@/components/onboarding/mailbox-setup-step";
import { PlanSelectStep } from "@/components/onboarding/plan-select-step";
import { PaymentStep } from "@/components/onboarding/payment-step";
import { RegisteringDomainStep } from "@/components/onboarding/registering-domain-step";
import { DnsSetupStep } from "@/components/onboarding/dns-setup-step";
import { SuccessStep } from "@/components/onboarding/success-step";
import {
  calcMailboxPricing,
  consumePendingOwnerName,
  defaultBranding,
  defaultMailPreferences,
  loadAccount,
  saveAccount,
  type BillingMonths,
  type Mailbox,
  type PlanId,
} from "@/lib/onboarding";
import { useTranslations } from "next-intl";
import { getProfile } from "@/services/auth.services";
import { setupMailAccount } from "@/services/onboarding.services";
import type { RegistrantContactSchema } from "@/schemas/onboarding.schemas";

type Step =
  | "choice"
  | "domain-enter"
  | "domain-search"
  | "registrant-contact"
  | "payment-domain"
  | "registering-domain"
  | "plan"
  | "mailboxes"
  | "payment-mailboxes"
  | "dns-setup"
  | "success";

const CASE1_ORDER: Step[] = [
  "choice",
  "domain-enter",
  "plan",
  "mailboxes",
  "payment-mailboxes",
  "dns-setup",
  "success",
];

const CASE2_ORDER: Step[] = [
  "choice",
  "domain-search",
  "registrant-contact",
  "payment-domain",
  "registering-domain",
  "plan",
  "mailboxes",
  "payment-mailboxes",
  "success",
];

function getOrder(hasDomain: boolean | null, skipPlan: boolean): Step[] {
  if (hasDomain === null) return ["choice"];
  const base = hasDomain ? CASE1_ORDER : CASE2_ORDER;
  return skipPlan ? base.filter((s) => s !== "plan") : base;
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingPageInner />
    </Suspense>
  );
}

function OnboardingPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tMailboxes = useTranslations("Onboarding.mailboxes");
  const [step, setStep] = useState<Step>("choice");
  const [hasDomain, setHasDomain] = useState<boolean | null>(null);
  const [domain, setDomain] = useState("");
  const [domainPrice, setDomainPrice] = useState<number | null>(null);
  const [registrantContact, setRegistrantContact] = useState<RegistrantContactSchema | null>(
    null,
  );
  const [mailboxes, setMailboxes] = useState<Mailbox[]>([]);
  const [billingMonths, setBillingMonths] = useState<BillingMonths>(1);
  const [plan, setPlan] = useState<PlanId>("core");
  const [planLocked, setPlanLocked] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState<number | null>(null);
  const [ownerEmail, setOwnerEmail] = useState<string | null>(null);
  const [mailAccountError, setMailAccountError] = useState<string | null>(null);
  const [creatingMailAccounts, setCreatingMailAccounts] = useState(false);

  useEffect(() => {
    getProfile().then((profile) => setOwnerEmail(profile?.email ?? null));
  }, []);

  useEffect(() => {
    const planParam = searchParams.get("plan");
    if (planParam === "core" || planParam === "plus") {
      setPlan(planParam);
      setPlanLocked(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const account = loadAccount();
    if (!account) return;
    if (account.stage === "complete") {
      router.replace("/dashboard");
      return;
    }
    if (account.stage === "awaiting-dns") {
      setHasDomain(true);
      setDomain(account.domain);
      setMailboxes(account.mailboxes);
      setPlan(account.plan);
      setStep("dns-setup");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const order = getOrder(hasDomain, planLocked);
  const stepIndex = Math.max(order.indexOf(step), 0);
  const showBack = stepIndex > 0 && step !== "success";

  function goBack() {
    let idx = order.indexOf(step) - 1;
    if (order[idx] === "registering-domain") idx -= 1;
    setStep(order[Math.max(idx, 0)]);
  }

  function persistComplete(dnsVerified: boolean) {
    const existing = loadAccount();
    saveAccount({
      hasDomain: hasDomain ?? true,
      domain,
      domainPrice,
      plan,
      mailboxes,
      roleAliases: existing?.roleAliases ?? [],
      dnsVerified,
      stage: "complete",
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      branding: existing?.branding ?? defaultBranding(),
      ownerName: existing?.ownerName || consumePendingOwnerName() || "",
      subscriptionStatus: existing?.subscriptionStatus ?? "active",
      subscriptionId: subscriptionId ?? existing?.subscriptionId ?? null,
      mailPreferences: existing?.mailPreferences ?? defaultMailPreferences(),
    });
  }

  async function finalizeMailboxCreation(): Promise<boolean> {
    setMailAccountError(null);
    setCreatingMailAccounts(true);
    const resp = await setupMailAccount(
      {
        data: mailboxes.map((mailbox) => ({
          username: mailbox.username,
          owner: mailbox.assignedTo || ownerEmail || "",
        })),
      },
      domain,
    );
    setCreatingMailAccounts(false);

    if (resp instanceof Error) {
      setMailAccountError(tMailboxes("creationError"));
      return false;
    }
    return true;
  }

  return (
    <OnboardingShell
      stepKey={step}
      stepIndex={stepIndex}
      totalSteps={order.length}
      onBack={showBack ? goBack : undefined}
      exitHref="/"
    >
      {step === "choice" && (
        <DomainChoiceStep
          initialValue={hasDomain}
          onContinue={(value) => {
            setHasDomain(value);
            setStep(value ? "domain-enter" : "domain-search");
          }}
        />
      )}

      {step === "domain-enter" && (
        <DomainEnterStep
          initialValue={domain}
          onContinue={(value) => {
            setDomain(value);
            setStep(planLocked ? "mailboxes" : "plan");
          }}
        />
      )}

      {step === "domain-search" && (
        <DomainSearchStep
          onContinue={(value, priceUsd) => {
            setDomain(value);
            setDomainPrice(priceUsd);
            setStep("registrant-contact");
          }}
        />
      )}

      {step === "registrant-contact" && (
        <RegistrantContactStep
          initialValue={registrantContact}
          onContinue={(contact) => {
            setRegistrantContact(contact);
            setStep("payment-domain");
          }}
        />
      )}

      {step === "payment-domain" && domainPrice !== null && registrantContact && (
        <PaymentStep
          variant="domain"
          domain={domain}
          registrantContact={registrantContact}
          lineItems={[{ label: domain, amount: domainPrice }]}
          onPaid={() => setStep("registering-domain")}
        />
      )}

      {step === "registering-domain" && (
        <RegisteringDomainStep
          domain={domain}
          onDone={() => setStep(planLocked ? "mailboxes" : "plan")}
        />
      )}

      {step === "plan" && (
        <PlanSelectStep
          initialValue={plan}
          onContinue={(value) => {
            setPlan(value);
            setStep("mailboxes");
          }}
        />
      )}

      {step === "mailboxes" && (
        <MailboxSetupStep
          domain={domain}
          plan={plan}
          initialMailboxes={mailboxes}
          initialBillingMonths={billingMonths}
          onContinue={(list, months) => {
            setMailboxes(list);
            setBillingMonths(months);
            setStep("payment-mailboxes");
          }}
        />
      )}

      {step === "payment-mailboxes" && (
        <PaymentStep
          variant="mailbox"
          plan={plan}
          mailboxQuantity={mailboxes.length}
          billingMonths={billingMonths}
          onCheckoutSuccess={(id) => setSubscriptionId(id)}
          lineItems={[
            {
              label: tMailboxes("summaryLine", {
                count: mailboxes.length,
                months: billingMonths,
              }),
              amount: calcMailboxPricing(mailboxes.length, billingMonths, plan).total,
            },
          ]}
          onPaid={async () => {
            if (hasDomain) {
              const created = await finalizeMailboxCreation();
              if (!created) return;
              setStep("dns-setup");
            } else {
              persistComplete(true);
              setStep("success");
            }
          }}
        />
      )}
      {step === "payment-mailboxes" && creatingMailAccounts && (
        <p className="mt-4 text-center text-sm text-muted-foreground">
          {tMailboxes("creatingAccounts")}
        </p>
      )}
      {step === "payment-mailboxes" && mailAccountError && (
        <p className="mt-4 text-center text-sm text-destructive">{mailAccountError}</p>
      )}

      {step === "dns-setup" && (
        <DnsSetupStep
          domain={domain}
          onVerified={() => {
            persistComplete(true);
            setStep("success");
          }}
          onFinishLater={() => {
            const existing = loadAccount();
            saveAccount({
              hasDomain: true,
              domain,
              domainPrice,
              plan,
              mailboxes,
              roleAliases: existing?.roleAliases ?? [],
              dnsVerified: false,
              stage: "awaiting-dns",
              createdAt: existing?.createdAt ?? new Date().toISOString(),
              branding: existing?.branding ?? defaultBranding(),
              ownerName: existing?.ownerName || consumePendingOwnerName() || "",
              subscriptionStatus: existing?.subscriptionStatus ?? "active",
              subscriptionId: subscriptionId ?? existing?.subscriptionId ?? null,
              mailPreferences: existing?.mailPreferences ?? defaultMailPreferences(),
            });
            router.push("/dashboard");
          }}
        />
      )}

      {step === "success" && <SuccessStep domain={domain} mailboxes={mailboxes} />}
    </OnboardingShell>
  );
}
