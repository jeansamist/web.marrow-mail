"use server";
import { GET, POST, PUT } from "@/lib/api";
import { createLogger } from "@/lib/logger";
import type { CheckoutSubscriptionSchema } from "@/schemas/subscription.schemas";
import type {
  CheckoutResult,
  Subscription,
  SubscriptionStatusResult,
} from "@/types";

const log = createLogger("subscription");

export const checkoutSubscription = async (
  data: CheckoutSubscriptionSchema,
): Promise<CheckoutResult | null> => {
  log.info(
    `Checkout subscription plan: ${data.planId} mailboxes: ${data.mailboxQuantity} months: ${data.billingMonths} method: ${data.paymentMethod} hasPhone: ${Boolean(data.customerPhone)}`,
  );
  const resp = await POST<CheckoutSubscriptionSchema, CheckoutResult>(
    "/onboarding/checkout-subscription",
    data,
  );
  if (resp instanceof Error) return null;
  return resp;
};

export const getSubscriptionStatus = async (
  id: number,
): Promise<SubscriptionStatusResult | null> => {
  log.info(`Get subscription status id: ${id}`);
  const resp = await GET<SubscriptionStatusResult>(
    `/onboarding/subscription-status/${id}`,
  );
  if (resp instanceof Error) return null;
  return resp;
};

export const getCurrentSubscription =
  async (): Promise<Subscription | null> => {
    log.info("Get current subscription for current user");
    const resp = await GET<Subscription | null>("/subscriptions/current");
    if (resp instanceof Error) return null;
    return resp;
  };

export const changeSubscriptionPlan = async (
  id: number,
  planId: "core" | "plus",
  currentPassword?: string,
): Promise<Subscription | Error> => {
  log.info(`Change subscription plan id: ${id} planId: ${planId}`);
  const resp = await PUT<
    { planId: "core" | "plus"; currentPassword?: string },
    Subscription
  >(`/subscriptions/${id}/change-plan`, { planId, currentPassword });
  return resp;
};

export const upgradeSubscriptionCheckout = async (
  id: number,
  data: {
    planId: "core" | "plus";
    paymentMethod: "card" | "mtn_mobile_money" | "orange_money";
    customerPhone?: string;
  },
): Promise<CheckoutResult | null> => {
  log.info(
    `Upgrade subscription checkout id: ${id} planId: ${data.planId} method: ${data.paymentMethod} hasPhone: ${Boolean(data.customerPhone)}`,
  );
  const resp = await POST<typeof data, CheckoutResult>(
    `/subscriptions/${id}/upgrade-checkout`,
    data,
  );
  if (resp instanceof Error) return null;
  return resp;
};

export const cancelSubscription = async (
  id: number,
): Promise<Subscription | null> => {
  log.info(`Cancel subscription id: ${id}`);
  const resp = await POST<undefined, Subscription>(
    `/subscriptions/${id}/cancel`,
    undefined,
  );
  if (resp instanceof Error) return null;
  return resp;
};

export const reactivateSubscription = async (
  id: number,
): Promise<Subscription | null> => {
  log.info(`Reactivate subscription id: ${id}`);
  const resp = await POST<undefined, Subscription>(
    `/subscriptions/${id}/reactivate`,
    undefined,
  );
  if (resp instanceof Error) return null;
  return resp;
};
