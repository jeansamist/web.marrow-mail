"use server"
import { GET, POST } from "@/lib/api"
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
