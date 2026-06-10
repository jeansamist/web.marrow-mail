"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup } from "@/components/ui/field"
import { InputField } from "@/components/ui/fields"
import { useCurrentLocaleUrl, useI18n } from "@/lib/i18n/client"
import { signUpSchema, SignUpSchema } from "@/schemas/auth.schemas"
import { signUp } from "@/services/auth.services"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FunctionComponent, useState } from "react"
import { useForm } from "react-hook-form"
export type SignUpFormProps = {
  [key: string]: unknown
}

export const SignUpForm: FunctionComponent<SignUpFormProps> = () => {
  const form = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  })
  const [errorMessage, setErrorMessage] = useState<string>()
  const t = useI18n()
  const { currentLocaleUrl } = useCurrentLocaleUrl()
  const router = useRouter()

  async function onSubmit(data: SignUpSchema) {
    const result = await signUp(data)
    if (result instanceof Error) {
      setErrorMessage(result.message ?? t("unknownError"))
      return
    }
    setErrorMessage(undefined)
    router.push(
      currentLocaleUrl(
        `/auth/verify-email?email=${encodeURIComponent(data.email)}`
      )
    )
  }
  return (
    <form id="sign-up-form" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup className="gap-3">
        {errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        <InputField
          formReturn={form}
          label={t("auth.signUp.firstName.label")}
          name="firstName"
          placeholder={t("auth.signUp.firstName.placeholder")}
        />
        <InputField
          formReturn={form}
          label={t("auth.signUp.lastName.label")}
          name="lastName"
          placeholder={t("auth.signUp.lastName.placeholder")}
        />
        <InputField
          formReturn={form}
          label={t("auth.signUp.email.label")}
          name="email"
          type="email"
          placeholder={t("auth.signUp.email.placeholder")}
        />
        <InputField
          formReturn={form}
          label={t("auth.signUp.password.label")}
          name="password"
          type="password"
          placeholder={t("auth.signUp.password.placeholder")}
        />
        <Field orientation="horizontal">
          <Button
            type="submit"
            disabled={!form.formState.isValid || form.formState.isSubmitting}
            form="sign-up-form"
          >
            {t("auth.signUp.submit")}
            {form.formState.isSubmitting && (
              <LoaderCircle className="animate-spin" />
            )}
          </Button>
          <Button type="button" asChild variant="link">
            <Link href={currentLocaleUrl("/auth/sign-in")}>
              {t("auth.signUp.signIn.link")}
            </Link>
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
