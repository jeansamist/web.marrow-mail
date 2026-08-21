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

export const registrantContactSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  organizationName: z.string().trim().optional(),
  addressLine1: z.string().trim().min(1),
  addressLine2: z.string().trim().optional(),
  city: z.string().trim().min(1),
  state: z.string().trim().optional(),
  countryCode: z.string().trim().length(2, "Use a 2-letter country code"),
  zipCode: z.string().trim().min(1),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^\+[0-9.]{6,20}$/, "Use the format +[country code].[number]"),
  email: z.string().trim().email(),
})
export type RegistrantContactSchema = z.infer<typeof registrantContactSchema>

export const createDomainPurchaseCheckoutSchema = z.object({
  domainName: onboardingRegisterDomainSchema.shape.name,
  paymentMethod: z.enum(["card", "mtn_mobile_money", "orange_money"]),
  customerPhone: z.string().trim().optional(),
  registrantContact: registrantContactSchema,
})
export type CreateDomainPurchaseCheckoutSchema = z.infer<
  typeof createDomainPurchaseCheckoutSchema
>
