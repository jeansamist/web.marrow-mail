import { z } from "zod/v3"
export const onboardingRegisterDomainSchema = z.object({
  name: z
    .string()
    .min(1)
    .trim()
    .regex(
      /^(?!-)[a-zA-Z0-9-]{1,63}(?<!-)(\.[a-zA-Z0-9-]{1,63})*\.[a-zA-Z]{2,}$/,
      "Invalid domain name (e.g. example.com)"
    ),
  valueChanged: z.boolean().optional(),
  oldValue: z.string().optional(),
})
export type OnboardingRegisterDomainSchema = z.infer<
  typeof onboardingRegisterDomainSchema
>

export const onboardingCreateEmailSchema = z.object({
  data: z.array(
    z.object({
      username: z.string().trim(),
      owner: z.string().trim().email(),
    })
  ),
})

export type OnboardingCreateEmailSchema = z.infer<
  typeof onboardingCreateEmailSchema
>

export const onboardingPaySchema = z.object({
  cardholderName: z.string().min(1, "Cardholder name is required"),
  cardNumber: z
    .string()
    .regex(/^\d{16}$/, "Card number must be 16 digits"),
  expiryDate: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Invalid expiry date (MM/YY)"),
  cvv: z.string().regex(/^\d{3,4}$/, "Invalid CVV"),
})
export type OnboardingPaySchema = z.infer<typeof onboardingPaySchema>
