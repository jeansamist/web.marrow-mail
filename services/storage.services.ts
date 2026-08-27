"use server"
import { GET, POST } from "@/lib/api"
import { createLogger } from "@/lib/logger"
import type {
  StorageAddonCheckoutResult,
  StorageAddonPaymentStatus,
  StorageUsage,
} from "@/types"

const log = createLogger("storage")

export const getStorageUsage = async (): Promise<StorageUsage | null> => {
  log.info("Get storage usage")
  const resp = await GET<StorageUsage>("/storage/usage")
  if (resp instanceof Error) return null
  return resp
}

export const createStorageAddonCheckout = async (data: {
  mailAccountId: number
  extraGB: number
  paymentMethod: "card" | "mtn_mobile_money" | "orange_money"
  customerPhone?: string
}) => {
  log.info(
    `Create storage addon checkout mail account: ${data.mailAccountId} extraGB: ${data.extraGB} method: ${data.paymentMethod} hasPhone: ${Boolean(data.customerPhone)}`
  )
  return POST<typeof data, StorageAddonCheckoutResult>("/storage/addon-checkout", data)
}

export const getStorageAddonPaymentStatus = async (paymentId: number) => {
  log.info(`Get storage addon payment status payment: ${paymentId}`)
  return GET<StorageAddonPaymentStatus>(`/storage/addon-payments/${paymentId}`)
}
