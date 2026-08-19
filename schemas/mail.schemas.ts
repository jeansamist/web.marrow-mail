import { z } from "zod/v3"

export const composeEmailSchema = z.object({
  to: z.string().email("Invalid email address").trim(),
  subject: z.string().trim(),
})
export type ComposeEmailSchema = z.infer<typeof composeEmailSchema>

const emailArray = z.array(z.string().email().trim().toLowerCase())

// Drafts may be saved incomplete (no recipients or subject yet), so every
// field here is optional, matching the backend's draftMailValidator.
export const draftMailSchema = z.object({
  to: emailArray.optional(),
  cc: emailArray.optional(),
  bcc: emailArray.optional(),
  replyTo: z.string().email().trim().toLowerCase().optional(),
  subject: z.string().trim().optional(),
  bodyHtml: z.string().optional(),
  bodyText: z.string().optional(),
  attachmentIds: z.array(z.number()).optional(),
})
export type DraftMailSchema = z.infer<typeof draftMailSchema>

export const forwardMailSchema = z.object({
  to: emailArray.min(1, "At least one recipient is required"),
  cc: emailArray.optional(),
  bcc: emailArray.optional(),
  replyTo: z.string().email().trim().toLowerCase().optional(),
  bodyHtml: z.string().optional(),
  bodyText: z.string().optional(),
})
export type ForwardMailSchema = z.infer<typeof forwardMailSchema>

export const moveMailToFolderSchema = z.object({
  folderId: z.number().nullable(),
})
export type MoveMailToFolderSchema = z.infer<typeof moveMailToFolderSchema>

export const markSpamSchema = z.object({
  isSpam: z.boolean(),
})
export type MarkSpamSchema = z.infer<typeof markSpamSchema>

export const markImportantSchema = z.object({
  important: z.boolean(),
})
export type MarkImportantSchema = z.infer<typeof markImportantSchema>

export const scheduleMailSchema = z.object({
  to: emailArray.min(1, "At least one recipient is required"),
  cc: emailArray.optional(),
  bcc: emailArray.optional(),
  replyTo: z.string().email().trim().toLowerCase().optional(),
  subject: z.string().trim(),
  bodyHtml: z.string().optional(),
  bodyText: z.string().optional(),
  attachmentIds: z.array(z.number()).optional(),
  scheduledAt: z.coerce.date(),
})
export type ScheduleMailSchema = z.infer<typeof scheduleMailSchema>

export const rescheduleMailSchema = z.object({
  scheduledAt: z.coerce.date(),
})
export type RescheduleMailSchema = z.infer<typeof rescheduleMailSchema>
