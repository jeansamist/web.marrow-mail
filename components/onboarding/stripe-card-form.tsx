"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Loader2 } from "lucide-react";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe-client";
import { cn } from "@/lib/utils";
import { premiumButton } from "@/components/onboarding/styles";

function CardFormInner({
  payLabel,
  onSuccess,
  onError,
}: {
  payLabel: string;
  onSuccess: () => void;
  onError: (message?: string) => void;
}) {
  const t = useTranslations("Onboarding.payment");
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!stripe || !elements) return;
    setSubmitting(true);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });
    setSubmitting(false);

    if (error) {
      onError(error.message);
      return;
    }
    if (paymentIntent?.status === "succeeded" || paymentIntent?.status === "processing") {
      onSuccess();
    } else {
      onError();
    }
  }

  return (
    <div className="mt-6 flex flex-col gap-3">
      <p className="text-sm font-medium text-foreground">{t("cardSectionLabel")}</p>
      <PaymentElement />
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!stripe || submitting}
        className={cn(
          "mt-2 w-full rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary-dark active:scale-95 disabled:cursor-not-allowed disabled:opacity-60",
          premiumButton,
        )}
      >
        {submitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="size-4 animate-spin" strokeWidth={1.5} />
            {t("processing")}
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <Check className="size-4" strokeWidth={2} />
            {payLabel}
          </span>
        )}
      </button>
    </div>
  );
}

export function StripeCardForm({
  clientSecret,
  payLabel,
  onSuccess,
  onError,
}: {
  clientSecret: string;
  payLabel: string;
  onSuccess: () => void;
  onError: (message?: string) => void;
}) {
  const t = useTranslations("Onboarding.payment");

  if (!stripePromise) {
    return (
      <p className="mt-6 text-sm text-destructive">{t("cardUnavailableError")}</p>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CardFormInner payLabel={payLabel} onSuccess={onSuccess} onError={onError} />
    </Elements>
  );
}
