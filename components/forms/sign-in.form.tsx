"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup } from "@/components/ui/field"
import { InputField } from "@/components/ui/fields"
import { useCurrentLocaleUrl, useI18n } from "@/lib/i18n/client"
import { signInSchema, SignInSchema } from "@/schemas/auth.schemas"
import { signIn } from "@/services/auth.services"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FunctionComponent, useState } from "react"
import { useForm } from "react-hook-form"

export type SignInFormProps = {
  [key: string]: unknown
}

export const SignInForm: FunctionComponent<SignInFormProps> = () => {
  const form = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  })
  const [errorMessage, setErrorMessage] = useState<string>()
  const t = useI18n()
  const { currentLocaleUrl } = useCurrentLocaleUrl()
  const router = useRouter()

  async function onSubmit(data: SignInSchema) {
    const result = await signIn(data)
    if (result instanceof Error) {
      setErrorMessage(result.message ?? t("unknownError"))
      return
    }
    setErrorMessage(undefined)
    router.push(currentLocaleUrl("/"))
  }

  return (
    <form id="sign-in-form" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup className="gap-3">
        {errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        <InputField
          formReturn={form}
          label={t("auth.signIn.email.label")}
          name="email"
          type="email"
          placeholder={t("auth.signIn.email.placeholder")}
        />
        <InputField
          formReturn={form}
          label={t("auth.signIn.password.label")}
          name="password"
          type="password"
          placeholder={t("auth.signIn.password.placeholder")}
        />
        <div className="flex justify-end">
          <Button type="button" asChild variant="link" className="w-fit px-0">
            <Link href={currentLocaleUrl("/auth/forgot-password")}>
              {t("auth.signIn.forgotPassword.link")}
            </Link>
          </Button>
        </div>
        <Field orientation="horizontal">
          <Button
            type="submit"
            disabled={!form.formState.isValid || form.formState.isSubmitting}
            form="sign-in-form"
          >
            {t("auth.signIn.submit")}
            {form.formState.isSubmitting && (
              <LoaderCircle className="animate-spin" />
            )}
          </Button>
          <Button type="button" asChild variant="link">
            <Link href={currentLocaleUrl("/auth/sign-up")}>
              {t("auth.signIn.signUp.link")}
            </Link>
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
