"use server"
import { GET, POST, PUT } from "@/lib/api"
import type { CheckoutSubscriptionSchema } from "@/schemas/subscription.schemas"
import type { CheckoutResult, Subscription } from "@/types"

export const checkoutSubscription = async (
  data: CheckoutSubscriptionSchema
): Promise<CheckoutResult | null> => {
  const resp = await POST<CheckoutSubscriptionSchema, CheckoutResult>(
    "/onboarding/checkout-subscription",
    data
  )
  if (resp instanceof Error) return null
  return resp
}

export const getSubscriptionStatus = async (id: number): Promise<Subscription | null> => {
  const resp = await GET<Subscription>(`/onboarding/subscription-status/${id}`)
  if (resp instanceof Error) return null
  return resp
}

export const getCurrentSubscription = async (): Promise<Subscription | null> => {
  const resp = await GET<Subscription | null>("/subscriptions/current")
  if (resp instanceof Error) return null
  return resp
}

export const changeSubscriptionPlan = async (
  id: number,
  planId: "core" | "plus"
): Promise<Subscription | null> => {
  const resp = await PUT<{ planId: "core" | "plus" }, Subscription>(
    `/subscriptions/${id}/change-plan`,
    { planId }
  )
  if (resp instanceof Error) return null
  return resp
}

export const cancelSubscription = async (id: number): Promise<Subscription | null> => {
  const resp = await POST<undefined, Subscription>(`/subscriptions/${id}/cancel`, undefined)
  if (resp instanceof Error) return null
  return resp
}

export const reactivateSubscription = async (id: number): Promise<Subscription | null> => {
  const resp = await POST<undefined, Subscription>(`/subscriptions/${id}/reactivate`, undefined)
  if (resp instanceof Error) return null
  return resp
}
