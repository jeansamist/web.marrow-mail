"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, Loader2, RotateCcw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatUsd, formatXaf, type BillingMonths, type PlanId } from "@/lib/onboarding";
import {
  OrangeMoneyLogo,
  MtnMoneyLogo,
  VisaLogo,
} from "@/components/marketing/payment-logos";
import { premiumButton, softShadow } from "@/components/onboarding/styles";
import { useToast } from "@/components/dashboard/toast";
import { checkoutSubscription, getSubscriptionStatus } from "@/services/subscription.services";
import {
  createDomainPurchaseCheckout,
  getDomainPurchaseStatus,
} from "@/services/domain-purchase.services";
import type { RegistrantContactSchema } from "@/schemas/onboarding.schemas";
import { StripeCardForm } from "@/components/onboarding/stripe-card-form";

type PaymentMethod = "orange" | "mtn" | "visa";

const methods: { id: PaymentMethod; name: string; Logo: typeof OrangeMoneyLogo }[] = [
  { id: "orange", name: "Orange Money", Logo: OrangeMoneyLogo },
  { id: "mtn", name: "MTN MoMo", Logo: MtnMoneyLogo },
  { id: "visa", name: "Card", Logo: VisaLogo },
];

const MAX_POLL_ATTEMPTS = 40;
const POLL_INTERVAL_MS = 3000;

export function PaymentStep({
  variant,
  lineItems,
  onPaid,
  plan,
  mailboxQuantity,
  billingMonths,
  onCheckoutSuccess,
  domain,
  registrantContact,
}: {
  variant: "domain" | "mailbox";
  lineItems: { label: string; amount: number }[];
  onPaid: () => void;
  plan?: PlanId;
  mailboxQuantity?: number;
  billingMonths?: BillingMonths;
  onCheckoutSuccess?: (subscriptionId: number) => void;
  domain?: string;
  registrantContact?: RegistrantContactSchema;
}) {
  const t = useTranslations("Onboarding.payment");
  const locale = useLocale();
  const { show } = useToast();
  const [method, setMethod] = useState<PaymentMethod>("orange");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState(false);
  const total = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const formatAmount = (amount: number) =>
    variant === "domain" ? formatUsd(amount, locale) : formatXaf(amount, locale);

  const [checkoutStatus, setCheckoutStatus] = useState<
    "idle" | "creating" | "confirming-card" | "awaiting-approval" | "declined" | "timeout"
  >("idle");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  // Subscription id (mailbox variant) or payment id (domain variant) — same
  // slot, since only one variant is ever mounted at a time.
  const [pendingId, setPendingId] = useState<number | null>(null);
  const pollAttemptsRef = useRef(0);

  async function handlePay() {
    if (method !== "visa" && !phone.trim()) {
      setPhoneError(true);
      return;
    }
    setPhoneError(false);
    setCheckoutStatus("creating");

    const paymentMethod =
      method === "visa" ? "card" : method === "orange" ? "orange_money" : "mtn_mobile_money";
    const customerPhone = method === "visa" ? undefined : phone.trim();

    if (variant === "mailbox") {
      const result = await checkoutSubscription({
        planId: plan!,
        mailboxQuantity: mailboxQuantity!,
        billingMonths: billingMonths!,
        paymentMethod,
        customerPhone,
      });

      if (!result) {
        setCheckoutStatus("declined");
        show(t("genericErrorDescription"), "error");
        return;
      }

      setPendingId(result.id);

      if ("clientSecret" in result && result.clientSecret) {
        setClientSecret(result.clientSecret);
        setCheckoutStatus("confirming-card");
        return;
      }

      pollAttemptsRef.current = 0;
      setCheckoutStatus("awaiting-approval");
      return;
    }

    const result = await createDomainPurchaseCheckout({
      domainName: domain!,
      paymentMethod,
      customerPhone,
      registrantContact: registrantContact!,
    });

    if (result instanceof Error) {
      setCheckoutStatus("declined");
      show(t("genericErrorDescription"), "error");
      return;
    }

    setPendingId(result.paymentId);

    if ("clientSecret" in result && result.clientSecret) {
      setClientSecret(result.clientSecret);
      setCheckoutStatus("confirming-card");
      return;
    }

    pollAttemptsRef.current = 0;
    setCheckoutStatus("awaiting-approval");
  }

  useEffect(() => {
    if (checkoutStatus !== "awaiting-approval" || pendingId === null) return;

    const interval = setInterval(async () => {
      pollAttemptsRef.current += 1;

      if (variant === "mailbox") {
        const subscription = await getSubscriptionStatus(pendingId);
        if (subscription?.status === "active") {
          clearInterval(interval);
          onCheckoutSuccess?.(pendingId);
          onPaid();
          return;
        }
        if (subscription?.status === "failed") {
          clearInterval(interval);
          setCheckoutStatus("declined");
          return;
        }
      } else {
        const purchase = await getDomainPurchaseStatus(pendingId);
        const status = purchase instanceof Error ? null : purchase.status;
        if (status === "completed") {
          clearInterval(interval);
          onPaid();
          return;
        }
        if (status === "failed") {
          clearInterval(interval);
          setCheckoutStatus("declined");
          return;
        }
      }

      if (pollAttemptsRef.current >= MAX_POLL_ATTEMPTS) {
        clearInterval(interval);
        setCheckoutStatus("timeout");
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant, checkoutStatus, pendingId]);

  function handleCardSuccess() {
    if (variant === "mailbox" && pendingId) onCheckoutSuccess?.(pendingId);
    onPaid();
  }

  function handleCardError(message?: string) {
    setCheckoutStatus("declined");
    show(message ?? t("genericErrorDescription"), "error");
  }

  function handleKeepWaiting() {
    pollAttemptsRef.current = 0;
    setCheckoutStatus("awaiting-approval");
  }

  const isPending = checkoutStatus === "creating" || checkoutStatus === "awaiting-approval";
  const isDeclined = checkoutStatus === "declined";

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {variant === "domain" ? t("domainTitle") : t("mailboxTitle")}
      </h1>
      <p className="mt-2 text-muted-foreground">
        {variant === "domain" ? t("domainDescription") : t("mailboxDescription")}
      </p>

      <div className="relative mt-8">
        <div
          aria-hidden
          className="absolute -inset-4 -z-10 rounded-[2rem] bg-primary/10 blur-2xl"
        />
        <div className={cn("rounded-xl border border-primary/20 bg-card p-5", softShadow)}>
          <ul className="flex flex-col gap-2.5">
            {lineItems.map((item) => (
              <li
                key={item.label}
                className="flex items-center justify-between text-sm text-foreground/85"
              >
                <span>{item.label}</span>
                <span className="font-mono">{formatAmount(item.amount)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <span className="font-medium text-foreground">{t("total")}</span>
            <span className="font-mono text-lg font-semibold text-foreground">
              {formatAmount(total)}
            </span>
          </div>
        </div>
      </div>

      <p className="mt-6 text-sm font-medium text-foreground">{t("payWith")}</p>
      <div className="mt-2 grid grid-cols-3 gap-2.5">
        {methods.map(({ id, name, Logo }) => (
          <button
            key={id}
            type="button"
            disabled={isPending || checkoutStatus === "confirming-card"}
            onClick={() => {
              setMethod(id);
              setPhoneError(false);
            }}
            style={method === id ? { borderColor: "var(--primary)" } : undefined}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl border p-3.5 transition-all duration-300 ease-out disabled:cursor-not-allowed disabled:opacity-60",
              method === id
                ? "bg-accent/40 ring-2 ring-primary/15"
                : "border-border bg-card hover:-translate-y-1 hover:border-primary/30 hover:shadow-md",
            )}
          >
            <Logo className="h-6 w-auto" />
            <span className="text-xs text-muted-foreground">{name}</span>
          </button>
        ))}
      </div>

      {method !== "visa" && checkoutStatus === "idle" && (
        <div className="mt-4">
          <label className="text-xs font-medium text-muted-foreground">{t("phoneLabel")}</label>
          <input
            value={phone}
            onChange={(e) => {
              setPhone(e.target.value);
              setPhoneError(false);
            }}
            placeholder={t("phonePlaceholder")}
            className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-50 outline-none transition-all duration-200 placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          {phoneError && (
            <p className="mt-1.5 text-xs text-destructive">{t("phoneRequired")}</p>
          )}
        </div>
      )}

      {isDeclined && (
        <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-sm text-destructive">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" strokeWidth={1.5} />
          <div>
            <p className="font-semibold">{t("declinedTitle")}</p>
            <p className="mt-0.5 text-destructive/85">
              {t("declinedDescription", {
                method: methods.find((m) => m.id === method)?.name ?? "",
              })}
            </p>
          </div>
        </div>
      )}

      {checkoutStatus === "awaiting-approval" && (
        <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-primary/25 bg-primary/5 p-3.5 text-sm text-foreground">
          <Loader2 className="mt-0.5 size-4 shrink-0 animate-spin text-primary" strokeWidth={1.5} />
          <div>
            <p className="font-semibold">{t("waitingTitle")}</p>
            <p className="mt-0.5 text-muted-foreground">
              {t("waitingDescription", { phone })}
            </p>
          </div>
        </div>
      )}

      {checkoutStatus === "timeout" && (
        <div className="mt-6 flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-sm">
          <div>
            <p className="font-semibold text-foreground">{t("waitingTimeoutTitle")}</p>
            <p className="mt-0.5 text-muted-foreground">{t("waitingTimeoutDescription")}</p>
          </div>
          <Button variant="outline" onClick={handleKeepWaiting}>
            {t("keepWaiting")}
          </Button>
        </div>
      )}

      {checkoutStatus === "confirming-card" && clientSecret && (
        <StripeCardForm
          clientSecret={clientSecret}
          payLabel={t("pay", { amount: formatAmount(total) })}
          onSuccess={handleCardSuccess}
          onError={handleCardError}
        />
      )}

      {checkoutStatus !== "confirming-card" &&
        checkoutStatus !== "awaiting-approval" &&
        checkoutStatus !== "timeout" && (
          <Button
            size="lg"
            className={cn("mt-8 w-full", premiumButton)}
            disabled={checkoutStatus === "creating"}
            onClick={handlePay}
          >
            {checkoutStatus === "creating" ? (
              <>
                <Loader2 className="size-4 animate-spin" strokeWidth={1.5} />
                {t("processing")}
              </>
            ) : checkoutStatus === "declined" ? (
              <>
                <RotateCcw className="size-4" strokeWidth={2} />
                {t("retry")}
              </>
            ) : (
              <>
                <Check className="size-4" strokeWidth={2} />
                {t("pay", { amount: formatAmount(total) })}
              </>
            )}
          </Button>
        )}
    </div>
  );
}
