"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup } from "@/components/ui/field"
import { InputField } from "@/components/ui/fields"
import { useCurrentLocaleUrl, useI18n } from "@/lib/i18n/client"
import { verifyEmailSchema, VerifyEmailSchema } from "@/schemas/auth.schemas"
import { verifyEmail } from "@/services/auth.services"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FunctionComponent, useState } from "react"
import { useForm } from "react-hook-form"

export type VerifyEmailFormProps = {
  email: string
}

export const VerifyEmailForm: FunctionComponent<VerifyEmailFormProps> = ({
  email,
}) => {
  const form = useForm<VerifyEmailSchema>({
    resolver: zodResolver(verifyEmailSchema),
    mode: "onChange",
    defaultValues: {
      email,
      emailVerificationCode: "",
    },
  })
  const [errorMessage, setErrorMessage] = useState<string>()
  const t = useI18n()
  const { currentLocaleUrl } = useCurrentLocaleUrl()
  const router = useRouter()

  async function onSubmit(data: VerifyEmailSchema) {
    const result = await verifyEmail(data)
    // if (!result.success) {
    //   setErrorMessage(result.message ?? t("unknownError"))
    //   return
    // }
    setErrorMessage(undefined)
    router.push(currentLocaleUrl("/"))
  }

  return (
    <form id="verify-email-form" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup className="gap-3">
        {errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        <InputField
          formReturn={form}
          name="emailVerificationCode"
          label={t("auth.verifyEmail.code.label")}
          placeholder={t("auth.verifyEmail.code.description")}
        />
        <Field orientation="horizontal">
          <Button
            type="submit"
            disabled={!form.formState.isValid || form.formState.isSubmitting}
            form="verify-email-form"
          >
            {t("auth.verifyEmail.submit")}
            {form.formState.isSubmitting && (
              <LoaderCircle className="animate-spin" />
            )}
          </Button>
          <Button type="button" asChild variant="link">
            <Link href={currentLocaleUrl("/auth/sign-in")}>
              {t("auth.verifyEmail.signIn.link")}
            </Link>
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
