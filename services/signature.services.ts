"use server"
import { GET, PUT } from "@/lib/api-mail"
import { createLogger } from "@/lib/logger"
import type { UpdateSignatureSchema } from "@/schemas/signature.schemas"
import type { Signature } from "@/types"

const log = createLogger("signature")

export const getSignature = async (): Promise<Signature | null> => {
  log.info("Get signature")
  const resp = await GET<Signature | null>("/signature")
  if (resp instanceof Error) return null
  return resp
}

export const updateSignature = async (
  payload: UpdateSignatureSchema
): Promise<Signature | null> => {
  log.info(`Update signature fields: ${Object.keys(payload).join(",")}`)
  const resp = await PUT<UpdateSignatureSchema, Signature>("/signature", payload)
  if (resp instanceof Error) return null
  return resp
}
