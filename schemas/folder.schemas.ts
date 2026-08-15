import { z } from "zod/v3"

// Shared by create and rename — the backend uses a single validator for both.
export const folderSchema = z.object({
  name: z.string().trim().min(1).max(100),
})
export type FolderSchema = z.infer<typeof folderSchema>
