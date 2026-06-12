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
