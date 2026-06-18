export type User = {
  id: number
  avatar: string | null
  firstName: string
  lastName: string
  email: string
  emailVerified: boolean
  createdAt: string
  updatedAt: string | null
  initials: string
}

export type AuthToken = {
  type: string
  name: string | null
  token: string | undefined
  abilities: string[]
  lastUsedAt: Date | null
  expiresAt: Date | null
}

export type Mail = {
  id: number
  mailAccountId: number
  fromEmail: string
  toAddresses: string[]
  ccAddresses: string[] | null
  bccAddresses: string[] | null
  replyTo: string | null
  subject: string
  bodyHtml: string | null
  bodyText: string | null
  status: string
  direction: "inbound" | "outbound"
  sesMessageId: string | null
  attachmentIds: string[] | null
  createdAt: string
  updatedAt: string | null
}

export type UploadedFile = {
  id: number
  key: string
  originalName: string
  mimeType: string | null
  size: number | null
  mailAccountId: number | null
  publicUrl: string
  createdAt: string
}

export type UploadLink = {
  uploadUrl: string
  file: UploadedFile
}

export type MailAccountProfile = {
  id: number
  email: string
  firstName: string
  lastName: string
  avatar: string | null
  initials: string
  createdAt: string
  updatedAt: string | null
}

export type Record = {
  id: number
  type: string
  name: string
  value: string
  priority: number | null
  createdAt: string
  updatedAt: string | null
}
