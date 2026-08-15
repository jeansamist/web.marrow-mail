import { z } from "zod/v3"

// A contact needs at least a name and an email to be selectable when composing;
// everything else is supplementary detail.
export const createContactSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().max(100).optional(),
  email: z.string().email().trim().toLowerCase(),
  phone: z.string().trim().max(30).optional(),
  company: z.string().trim().max(150).optional(),
  notes: z.string().trim().max(2000).optional(),
})
export type CreateContactSchema = z.infer<typeof createContactSchema>

export const updateContactSchema = z.object({
  firstName: z.string().trim().min(1).max(100).optional(),
  lastName: z.string().trim().max(100).optional(),
  email: z.string().email().trim().toLowerCase().optional(),
  phone: z.string().trim().max(30).optional(),
  company: z.string().trim().max(150).optional(),
  notes: z.string().trim().max(2000).optional(),
})
export type UpdateContactSchema = z.infer<typeof updateContactSchema>
