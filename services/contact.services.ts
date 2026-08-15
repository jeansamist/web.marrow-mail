"use server"
import { DELETE, GET, POST, PUT } from "@/lib/api-mail"
import type { CreateContactSchema, UpdateContactSchema } from "@/schemas/contact.schemas"
import type { Contact } from "@/types"

export const getContacts = async (query?: string): Promise<Contact[]> => {
  const resp = await GET<Contact[]>(
    query ? `/contacts?q=${encodeURIComponent(query)}` : "/contacts"
  )
  if (resp instanceof Error) return []
  return resp
}

export const getContact = async (id: number): Promise<Contact | null> => {
  const resp = await GET<Contact>(`/contacts/${id}`)
  if (resp instanceof Error) return null
  return resp
}

export const createContact = async (payload: CreateContactSchema): Promise<Contact | null> => {
  const resp = await POST<CreateContactSchema, Contact>("/contacts", payload)
  if (resp instanceof Error) return null
  return resp
}

export const updateContact = async (
  id: number,
  payload: UpdateContactSchema
): Promise<Contact | null> => {
  const resp = await PUT<UpdateContactSchema, Contact>(`/contacts/${id}`, payload)
  if (resp instanceof Error) return null
  return resp
}

export const deleteContact = async (id: number): Promise<boolean> => {
  const resp = await DELETE(`/contacts/${id}`)
  return !(resp instanceof Error)
}
