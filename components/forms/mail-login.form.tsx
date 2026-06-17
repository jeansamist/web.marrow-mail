"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup } from "@/components/ui/field"
import { InputField } from "@/components/ui/fields"
import { useCurrentLocaleUrl, useI18n } from "@/lib/i18n/client"
import { signInSchema, SignInSchema } from "@/schemas/auth.schemas"
import { loginMailAccount } from "@/services/mail.services"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { FunctionComponent, useState } from "react"
import { useForm } from "react-hook-form"

export type MailLoginFormProps = {
  domainName: string
}

export const MailLoginForm: FunctionComponent<MailLoginFormProps> = ({
  domainName,
}) => {
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
    const result = await loginMailAccount(data)
    if (result instanceof Error) {
      setErrorMessage(result.message ?? t("unknownError"))
      return
    }
    setErrorMessage(undefined)
    router.push(currentLocaleUrl(`/domain/${domainName}/inbox`))
  }

  return (
    <form id="mail-login-form" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup className="gap-3">
        {errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        <InputField
          formReturn={form}
          label={t("mail.login.email.label")}
          name="email"
          type="email"
          placeholder={t("mail.login.email.placeholder")}
        />
        <InputField
          formReturn={form}
          label={t("mail.login.password.label")}
          name="password"
          type="password"
          placeholder={t("mail.login.password.placeholder")}
        />
        <Field orientation="horizontal">
          <Button
            type="submit"
            disabled={!form.formState.isValid || form.formState.isSubmitting}
            form="mail-login-form"
          >
            {t("mail.login.submit")}
            {form.formState.isSubmitting && (
              <LoaderCircle className="animate-spin" />
            )}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
