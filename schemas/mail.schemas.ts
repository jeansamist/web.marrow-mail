import { z } from "zod/v3"

export const composeEmailSchema = z.object({
  to: z.string().email("Invalid email address").trim(),
  subject: z.string().trim(),
})
export type ComposeEmailSchema = z.infer<typeof composeEmailSchema>
