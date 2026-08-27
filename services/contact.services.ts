"use server"
import { DELETE, GET, POST, PUT } from "@/lib/api-mail"
import { createLogger } from "@/lib/logger"
import type { CreateContactSchema, UpdateContactSchema } from "@/schemas/contact.schemas"
import type { Contact } from "@/types"

const log = createLogger("contact")

export const getContacts = async (query?: string): Promise<Contact[]> => {
  log.info(query ? `Get contacts query: ${query}` : "Get contacts")
  const resp = await GET<Contact[]>(
    query ? `/contacts?q=${encodeURIComponent(query)}` : "/contacts"
  )
  if (resp instanceof Error) return []
  return resp
}

export const getContact = async (id: number): Promise<Contact | null> => {
  log.info(`Get contact: ${id}`)
  const resp = await GET<Contact>(`/contacts/${id}`)
  if (resp instanceof Error) return null
  return resp
}

export const createContact = async (payload: CreateContactSchema): Promise<Contact | null> => {
  log.info(`Create contact email: ${payload.email}`)
  const resp = await POST<CreateContactSchema, Contact>("/contacts", payload)
  if (resp instanceof Error) return null
  return resp
}

export const updateContact = async (
  id: number,
  payload: UpdateContactSchema
): Promise<Contact | null> => {
  log.info(`Update contact: ${id} fields: ${Object.keys(payload).join(",")}`)
  const resp = await PUT<UpdateContactSchema, Contact>(`/contacts/${id}`, payload)
  if (resp instanceof Error) return null
  return resp
}

export const deleteContact = async (id: number): Promise<boolean> => {
  log.info(`Delete contact: ${id}`)
  const resp = await DELETE(`/contacts/${id}`)
  return !(resp instanceof Error)
}
