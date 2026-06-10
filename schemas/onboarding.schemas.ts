import { z } from "zod/v3"
export const onboardingRegisterDomainSchema = z.object({
  domain: z.string().min(1).trim(),
  valueChanged: z.boolean().optional(),
  oldValue: z.string().optional(),
})
export type OnboardingRegisterDomainSchema = z.infer<
  typeof onboardingRegisterDomainSchema
>
