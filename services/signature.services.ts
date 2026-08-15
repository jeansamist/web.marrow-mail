"use server"
import { GET, PUT } from "@/lib/api-mail"
import type { UpdateSignatureSchema } from "@/schemas/signature.schemas"
import type { Signature } from "@/types"

export const getSignature = async (): Promise<Signature | null> => {
  const resp = await GET<Signature | null>("/signature")
  if (resp instanceof Error) return null
  return resp
}

export const updateSignature = async (
  payload: UpdateSignatureSchema
): Promise<Signature | null> => {
  const resp = await PUT<UpdateSignatureSchema, Signature>("/signature", payload)
  if (resp instanceof Error) return null
  return resp
}
