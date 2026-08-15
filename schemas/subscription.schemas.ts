import { z } from "zod/v3"

export const checkoutSubscriptionSchema = z.object({
  planId: z.enum(["core", "plus"]),
  mailboxQuantity: z.number().int().min(1),
  billingMonths: z.union([z.literal(1), z.literal(3), z.literal(6), z.literal(12)]),
  paymentMethod: z.enum(["card", "mtn_mobile_money", "orange_money"]),
  customerPhone: z.string().trim().min(6).optional(),
})
export type CheckoutSubscriptionSchema = z.infer<typeof checkoutSubscriptionSchema>
