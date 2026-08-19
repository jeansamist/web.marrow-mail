"use server"
import { GET } from "@/lib/api"
import type { StorageUsage } from "@/types"

export const getStorageUsage = async (): Promise<StorageUsage | null> => {
  const resp = await GET<StorageUsage>("/storage/usage")
  if (resp instanceof Error) return null
  return resp
}
