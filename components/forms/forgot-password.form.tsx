"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup } from "@/components/ui/field"
import { InputField } from "@/components/ui/fields"
import { useCurrentLocaleUrl, useI18n } from "@/lib/i18n/client"
import {
  forgotPasswordSchema,
  ForgotPasswordSchema,
} from "@/schemas/auth.schemas"
import { forgotPassword } from "@/services/auth.services"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle, MailCheck } from "lucide-react"
import Link from "next/link"
import { FunctionComponent, useState } from "react"
import { useForm } from "react-hook-form"

export type ForgotPasswordFormProps = {
  [key: string]: unknown
}

export const ForgotPasswordForm: FunctionComponent<
  ForgotPasswordFormProps
> = () => {
  const form = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
    },
  })
  const [errorMessage, setErrorMessage] = useState<string>()
  const [sent, setSent] = useState(false)
  const t = useI18n()
  const { currentLocaleUrl } = useCurrentLocaleUrl()

  async function onSubmit(data: ForgotPasswordSchema) {
    const result = await forgotPassword(data)
    if (result instanceof Error) {
      setErrorMessage(result.message ?? t("unknownError"))
      return
    }
    setErrorMessage(undefined)
    setSent(true)
  }

  if (sent) {
    return (
      <FieldGroup className="gap-3">
        <Alert>
          <MailCheck className="size-4" />
          <AlertTitle>{t("auth.forgotPassword.success.title")}</AlertTitle>
          <AlertDescription>
            {t("auth.forgotPassword.success.description")}
          </AlertDescription>
        </Alert>
        <Button type="button" asChild variant="link" className="w-fit px-0">
          <Link href={currentLocaleUrl("/auth/sign-in")}>
            {t("auth.forgotPassword.signIn.link")}
          </Link>
        </Button>
      </FieldGroup>
    )
  }

  return (
    <form id="forgot-password-form" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup className="gap-3">
        {errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        <InputField
          formReturn={form}
          label={t("auth.forgotPassword.email.label")}
          name="email"
          type="email"
          placeholder={t("auth.forgotPassword.email.placeholder")}
        />
        <Field orientation="horizontal">
          <Button
            type="submit"
            disabled={!form.formState.isValid || form.formState.isSubmitting}
            form="forgot-password-form"
          >
            {t("auth.forgotPassword.submit")}
            {form.formState.isSubmitting && (
              <LoaderCircle className="animate-spin" />
            )}
          </Button>
          <Button type="button" asChild variant="link">
            <Link href={currentLocaleUrl("/auth/sign-in")}>
              {t("auth.forgotPassword.signIn.link")}
            </Link>
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
