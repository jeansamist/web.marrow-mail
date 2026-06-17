"use server"
import { POST } from "@/lib/api"
import { SetupMailAccountProfileSchema } from "@/schemas/auth.schemas"
import { Record } from "@/types"

export const setupMailAccountProfile = async (
  data: SetupMailAccountProfileSchema
) => {
  return POST<SetupMailAccountProfileSchema, Record[]>(
    "/mail/setup-profile",
    data
  )
}
