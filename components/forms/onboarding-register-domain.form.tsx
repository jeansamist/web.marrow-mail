"use client"

import { useCurrentLocaleUrl, useI18n } from "@/lib/i18n/client"
import {
  onboardingRegisterDomainSchema,
  OnboardingRegisterDomainSchema,
} from "@/schemas/onboarding.schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { LoaderCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FunctionComponent, useState } from "react"
import { useForm } from "react-hook-form"
import { Alert, AlertDescription } from "../ui/alert"
import { Button } from "../ui/button"
import { Field, FieldGroup } from "../ui/field"
import { InputField } from "../ui/fields"

export type OnboardingRegisterDomainFormProps = {
  [key: string]: unknown
}

export const OnboardingRegisterDomainForm: FunctionComponent<
  OnboardingRegisterDomainFormProps
> = () => {
  const form = useForm<OnboardingRegisterDomainSchema>({
    resolver: zodResolver(onboardingRegisterDomainSchema),
    mode: "onChange",
    defaultValues: {
      domain: "",
      valueChanged: false,
    },
  })
  const [errorMessage, setErrorMessage] = useState<string>()
  const t = useI18n()
  const { currentLocaleUrl } = useCurrentLocaleUrl()
  const router = useRouter()

  async function onSubmit(data: OnboardingRegisterDomainSchema) {
    const result = new Error("Not implemented")
    if (result instanceof Error) {
      setErrorMessage(result.message ?? t("unknownError"))
      return
    }
    setErrorMessage(undefined)
    router.push(
      currentLocaleUrl(
        `/onboarding/configure-dns?domain=${encodeURIComponent(data.domain)}`
      )
    )
  }
  return (
    <form id="register-domain-form" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup className="gap-3">
        {errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        <InputField
          formReturn={form}
          label={t("onboarding.registerDomain.form.domain.label")}
          name="domain"
          placeholder={t("onboarding.registerDomain.form.domain.placeholder")}
        />
        <Field orientation="horizontal">
          <Button
            type="submit"
            disabled={!form.formState.isValid || form.formState.isSubmitting}
            form="register-domain-form"
          >
            {t("onboarding.registerDomain.continue")}
            {form.formState.isSubmitting && (
              <LoaderCircle className="animate-spin" />
            )}
          </Button>
          <Button type="button" asChild variant="link">
            <Link href={currentLocaleUrl("#")}>
              {t("onboarding.registerDomain.alreadyHaveDomain.link")}
            </Link>
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
