"use server"
import { GET, POST } from "@/lib/api"
import type {
  StorageAddonCheckoutResult,
  StorageAddonPaymentStatus,
  StorageUsage,
} from "@/types"

export const getStorageUsage = async (): Promise<StorageUsage | null> => {
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
  return POST<typeof data, StorageAddonCheckoutResult>("/storage/addon-checkout", data)
}

export const getStorageAddonPaymentStatus = async (paymentId: number) => {
  return GET<StorageAddonPaymentStatus>(`/storage/addon-payments/${paymentId}`)
}
