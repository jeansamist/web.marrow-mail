"use server"
import { DELETE, GET, POST, PUT } from "@/lib/api-mail"
import { createLogger } from "@/lib/logger"
import type { FolderSchema } from "@/schemas/folder.schemas"
import type { Folder, Mail } from "@/types"

const log = createLogger("folder")

export const getFolders = async (): Promise<Folder[]> => {
  log.info("Get folders")
  const resp = await GET<Folder[]>("/folders")
  if (resp instanceof Error) return []
  return resp
}

export const createFolder = async (payload: FolderSchema): Promise<Folder | null> => {
  log.info(`Create folder name: ${payload.name}`)
  const resp = await POST<FolderSchema, Folder>("/folders", payload)
  if (resp instanceof Error) return null
  return resp
}

export const renameFolder = async (
  id: number,
  payload: FolderSchema
): Promise<Folder | null> => {
  log.info(`Rename folder: ${id} name: ${payload.name}`)
  const resp = await PUT<FolderSchema, Folder>(`/folders/${id}`, payload)
  if (resp instanceof Error) return null
  return resp
}

export const deleteFolder = async (id: number): Promise<boolean> => {
  log.info(`Delete folder: ${id}`)
  const resp = await DELETE(`/folders/${id}`)
  return !(resp instanceof Error)
}

export const getFolderMails = async (id: number): Promise<Mail[]> => {
  log.info(`Get folder mails folder: ${id}`)
  const resp = await GET<Mail[]>(`/folders/${id}/mails`)
  if (resp instanceof Error) return []
  return resp
}
