import { z } from "zod/v3"

export const signUpSchema = z.object({
  firstName: z.string().min(1).trim(),
  lastName: z.string().min(1).trim(),
  email: z.string().email().trim(),
  password: z.string().min(8),
})
export type SignUpSchema = z.infer<typeof signUpSchema>

export const signInSchema = z.object({
  email: z.string().email().trim(),
  password: z.string().min(8),
})
export type SignInSchema = z.infer<typeof signInSchema>

export const verifyEmailSchema = z.object({
  email: z.string().email().trim(),
  emailVerificationCode: z.string().min(6).max(6),
})
export type VerifyEmailSchema = z.infer<typeof verifyEmailSchema>

export const forgotPasswordSchema = z.object({
  email: z.string().email().trim(),
})
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z.object({
  email: z.string().email().trim(),
  resetPasswordToken: z.string().min(4),
  newPassword: z.string().min(8),
})
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>

export const setupMailAccountProfileSchema = z
  .object({
    firstName: z.string().min(1).max(255),
    lastName: z.string().min(1).max(255),
    avatar: z.string().nullable(),
    cuid: z.string().min(1),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
export type SetupMailAccountProfileSchema = z.infer<
  typeof setupMailAccountProfileSchema
>
