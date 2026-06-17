"use server"
import { POST } from "@/lib/api-mail"
import { SetupMailAccountProfileSchema } from "@/schemas/auth.schemas"

export const setupMailAccountProfile = async (
  data: SetupMailAccountProfileSchema
) => {
  return POST<SetupMailAccountProfileSchema, unknown>("/setup-profile", data)
}
