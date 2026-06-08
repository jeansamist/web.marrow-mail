"use server"

import {
  ForgotPasswordSchema,
  ResetPasswordSchema,
  SignInSchema,
  SignUpSchema,
  VerifyEmailSchema,
} from "@/schemas/auth.schemas"
import type { User } from "@/types"

export const signUp = async (payload: SignUpSchema) => {
  // const [data, error] = await tuyau.api.auth.signUp({ body: payload }).safe()
  // return error ? error.response : data
}

export const signIn = async (payload: SignInSchema) => {
  // const [data, error] = await tuyau.api.auth.signIn({ body: payload }).safe()
  // return error ? error.response : data
}

export const verifyEmail = async (payload: VerifyEmailSchema) => {
  // const [data, error] = await tuyau.api.auth.verifyEmail({ body: payload }).safe()
  // return error ? error.response : data
}

export const forgotPassword = async (payload: ForgotPasswordSchema) => {
  // const [data, error] = await tuyau.api.auth.forgotPassword({ body: payload }).safe()
  // return error ? error.response : data
}

export const resetPassword = async (payload: ResetPasswordSchema) => {
  // const [data, error] = await tuyau.api.auth.resetPassword({ body: payload }).safe()
  // return error ? error.response : data
}

export const getProfile = async (): Promise<User | null> => {
  // const [data, error] = await tuyau.api.auth.profile({}).safe()
  // if (error || !data?.success) return null
  // return (data.data as User) ?? null
  return null
}
