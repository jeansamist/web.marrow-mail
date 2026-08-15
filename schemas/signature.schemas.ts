import { z } from "zod/v3"

// A signature is a singleton per mail account, saved via a single upsert call —
// every field is optional so a partial save never fails validation.
export const updateSignatureSchema = z.object({
  name: z.string().trim().max(150).optional(),
  jobTitle: z.string().trim().max(150).optional(),
  includePhoto: z.boolean().optional(),
  phone: z.string().trim().max(30).optional(),
  website: z.string().trim().max(255).optional(),
  address: z.string().trim().max(255).optional(),
  linkedin: z.string().trim().max(255).optional(),
  facebook: z.string().trim().max(255).optional(),
  instagram: z.string().trim().max(255).optional(),
  includeInNewEmails: z.boolean().optional(),
  includeInReplies: z.boolean().optional(),
})
export type UpdateSignatureSchema = z.infer<typeof updateSignatureSchema>
