"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup } from "@/components/ui/field"
import { InputField } from "@/components/ui/fields"
import { useCurrentLocaleUrl, useI18n } from "@/lib/i18n/client"
import {
  resetPasswordSchema,
  ResetPasswordSchema,
} from "@/schemas/auth.schemas"
import { resetPassword } from "@/services/auth.services"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FunctionComponent, useState } from "react"
import { useForm } from "react-hook-form"

export type ResetPasswordFormProps = {
  email: string
  resetPasswordToken: string
}

export const ResetPasswordForm: FunctionComponent<ResetPasswordFormProps> = ({
  email,
  resetPasswordToken,
}) => {
  const form = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
    defaultValues: {
      email,
      resetPasswordToken,
      newPassword: "",
    },
  })
  const [errorMessage, setErrorMessage] = useState<string>()
  const t = useI18n()
  const { currentLocaleUrl } = useCurrentLocaleUrl()
  const router = useRouter()

  async function onSubmit(data: ResetPasswordSchema) {
    const result = await resetPassword(data)
    if (result instanceof Error) {
      setErrorMessage(result.message ?? t("unknownError"))
      return
    }
    setErrorMessage(undefined)
    router.push(currentLocaleUrl("/auth/sign-in"))
  }

  return (
    <form id="reset-password-form" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup className="gap-3">
        {errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        <InputField
          formReturn={form}
          label={t("auth.resetPassword.newPassword.label")}
          name="newPassword"
          type="password"
          placeholder={t("auth.resetPassword.newPassword.placeholder")}
        />
        <Field orientation="horizontal">
          <Button
            type="submit"
            disabled={!form.formState.isValid || form.formState.isSubmitting}
            form="reset-password-form"
          >
            {t("auth.resetPassword.submit")}
            {form.formState.isSubmitting && (
              <LoaderCircle className="animate-spin" />
            )}
          </Button>
          <Button type="button" asChild variant="link">
            <Link href={currentLocaleUrl("/auth/sign-in")}>
              {t("auth.resetPassword.signIn.link")}
            </Link>
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
