"use server"
import { DELETE, GET, POST, PUT } from "@/lib/api-mail"
import type { FolderSchema } from "@/schemas/folder.schemas"
import type { Folder, Mail } from "@/types"

export const getFolders = async (): Promise<Folder[]> => {
  const resp = await GET<Folder[]>("/folders")
  if (resp instanceof Error) return []
  return resp
}

export const createFolder = async (payload: FolderSchema): Promise<Folder | null> => {
  const resp = await POST<FolderSchema, Folder>("/folders", payload)
  if (resp instanceof Error) return null
  return resp
}

export const renameFolder = async (
  id: number,
  payload: FolderSchema
): Promise<Folder | null> => {
  const resp = await PUT<FolderSchema, Folder>(`/folders/${id}`, payload)
  if (resp instanceof Error) return null
  return resp
}

export const deleteFolder = async (id: number): Promise<boolean> => {
  const resp = await DELETE(`/folders/${id}`)
  return !(resp instanceof Error)
}

export const getFolderMails = async (id: number): Promise<Mail[]> => {
  const resp = await GET<Mail[]>(`/folders/${id}/mails`)
  if (resp instanceof Error) return []
  return resp
}
