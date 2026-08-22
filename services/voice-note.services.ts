"use server"
import { GET } from "@/lib/api"

export type PublicVoiceNote = {
  audioUrl: string
  originalName: string
  mimeType: string | null
}

export const getPublicVoiceNote = async (token: string): Promise<PublicVoiceNote | null> => {
  const resp = await GET<PublicVoiceNote>(`/voice-notes/${token}`)
  if (resp instanceof Error) return null
  return resp
}
