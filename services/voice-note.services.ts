"use server"
import { GET } from "@/lib/api"
import { createLogger } from "@/lib/logger"

export type PublicVoiceNote = {
  audioUrl: string
  originalName: string
  mimeType: string | null
}

const log = createLogger("voice-note")

export const getPublicVoiceNote = async (token: string): Promise<PublicVoiceNote | null> => {
  log.info("Get public voice note")
  const resp = await GET<PublicVoiceNote>(`/voice-notes/${token}`)
  if (resp instanceof Error) return null
  return resp
}
