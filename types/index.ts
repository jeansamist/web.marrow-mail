export type User = {
  id: number
  avatar: string | null
  firstName: string
  lastName: string
  businessName: string | null
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
  toAddresses: string[] | null
  ccAddresses: string[] | null
  bccAddresses: string[] | null
  replyTo: string | null
  subject: string | null
  bodyHtml: string | null
  bodyText: string | null
  status: string
  direction: "sent" | "received"
  sesMessageId: string | null
  attachmentIds: number[] | null
  important: boolean
  isSpam: boolean
  isRead: boolean
  deleted: boolean
  folderId: number | null
  scheduledAt: string | null
  createdAt: string
  updatedAt: string | null
}

export type Folder = {
  id: number
  mailAccountId: number
  name: string
  createdAt: string
  updatedAt: string | null
}

export type Contact = {
  id: number
  mailAccountId: number
  firstName: string
  lastName: string | null
  email: string
  phone: string | null
  company: string | null
  notes: string | null
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
  firstName: string
  lastName: string
  avatar: string | null
  mailAccountId: number
  createdAt: string
  updatedAt: string | null
  // Only present in the /mail/auth/profile response, not the setup/update-profile ones.
  twoFactorEnabled?: boolean
  forwardingEmail?: string | null
  forwardingVerified?: boolean
  keepForwardedCopy?: boolean
  // Only present in the /mail/setup-profile response.
  email?: string
}

export type TwoFactorSetup = {
  secret: string
  otpauthUrl: string
  backupCodes: string[]
}

export type Signature = {
  id: number
  mailAccountId: number
  name: string | null
  jobTitle: string | null
  includePhoto: boolean
  phone: string | null
  website: string | null
  address: string | null
  linkedin: string | null
  facebook: string | null
  instagram: string | null
  includeInNewEmails: boolean
  includeInReplies: boolean
  createdAt: string
  updatedAt: string | null
}

export type PaymentProvider = "stripe" | "elgiopay"

export type SubscriptionStatus =
  | "pending"
  | "active"
  | "past_due"
  | "canceled"
  | "expired"
  | "failed"

export type Subscription = {
  id: number
  provider: PaymentProvider
  status: SubscriptionStatus
  planId: "core" | "plus"
  mailboxQuantity: number
  billingMonths: number
  currency: string
  amountTotal: number
  currentPeriodEnd: string | null
  createdAt: string
  updatedAt: string | null
}

export type CheckoutResult =
  | (Subscription & { clientSecret: string | null })
  | (Subscription & { transactionId: string })

export type MailAccount = {
  id: number
  username: string
  ownerEmail: string | null
  createdAt: string
}

export type Domain = {
  id: number
  name: string
  description: string | null
  verified: boolean
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
