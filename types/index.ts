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
