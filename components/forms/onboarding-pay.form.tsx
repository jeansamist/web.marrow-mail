"use client"

import { useOnboarding } from "@/contexts/onboarding.context"
import { useCurrentLocaleUrl, useI18n } from "@/lib/i18n/client"
import {
  onboardingPaySchema,
  OnboardingPaySchema,
} from "@/schemas/onboarding.schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, LoaderCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FunctionComponent, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { Field, FieldGroup } from "../ui/field"
import { InputField } from "../ui/fields"

export type OnboardingPayFormProps = {
  domainParams: string
  [key: string]: unknown
}

export const OnboardingPayForm: FunctionComponent<OnboardingPayFormProps> = ({
  domainParams,
}) => {
  const onboarding = useOnboarding()
  const form = useForm<OnboardingPaySchema>({
    resolver: zodResolver(onboardingPaySchema),
    mode: "onChange",
    defaultValues: {
      cardholderName: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
    },
  })
  const t = useI18n()
  const { currentLocaleUrl } = useCurrentLocaleUrl()
  const router = useRouter()

  // Check domain consistency with context
  useEffect(() => {
    const contextStepValues = onboarding.steps[0].values as
      | { domain?: string }
      | undefined
    const contextDomain = contextStepValues?.domain
    if (contextDomain && contextDomain !== domainParams) {
      router.push(currentLocaleUrl("/onboarding/"))
    }
  }, [currentLocaleUrl, domainParams, onboarding.steps, router])

  const onSubmit = async (data: OnboardingPaySchema) => {
    // TODO: replace with Stripe payment intent
    onboarding.setStepValues(3, data as unknown as Record<string, unknown>)
    router.push(currentLocaleUrl(`/onboarding/complete?domain=${encodeURIComponent(domainParams)}`))
  }

  return (
    <form
      id="pay-form"
      className="space-y-4"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <Card>
        <CardContent className="space-y-4">
          <FieldGroup className="gap-3">
            <InputField
              formReturn={form}
              label={t("onboarding.pay.form.cardholderName.label")}
              name="cardholderName"
              placeholder={t("onboarding.pay.form.cardholderName.placeholder")}
              autoComplete="cc-name"
            />
            <InputField
              formReturn={form}
              label={t("onboarding.pay.form.cardNumber.label")}
              name="cardNumber"
              placeholder={t("onboarding.pay.form.cardNumber.placeholder")}
              autoComplete="cc-number"
              inputMode="numeric"
              maxLength={16}
            />
            <div className="grid grid-cols-2 gap-4">
              <InputField
                formReturn={form}
                label={t("onboarding.pay.form.expiryDate.label")}
                name="expiryDate"
                placeholder={t("onboarding.pay.form.expiryDate.placeholder")}
                autoComplete="cc-exp"
                maxLength={5}
              />
              <InputField
                formReturn={form}
                label={t("onboarding.pay.form.cvv.label")}
                name="cvv"
                placeholder={t("onboarding.pay.form.cvv.placeholder")}
                autoComplete="cc-csc"
                inputMode="numeric"
                maxLength={4}
              />
            </div>
          </FieldGroup>
        </CardContent>
      </Card>
      <Field orientation="horizontal">
        <Button variant="outline" asChild>
          <Link
            href={currentLocaleUrl(
              `/onboarding/create-email?domain=${domainParams}`
            )}
          >
            <ArrowLeft />
            {t("onboarding.pay.back")}
          </Link>
        </Button>
        <Button
          type="submit"
          disabled={!form.formState.isValid || form.formState.isSubmitting}
          form="pay-form"
        >
          {t("onboarding.pay.submit")}
          {form.formState.isSubmitting && (
            <LoaderCircle className="animate-spin" />
          )}
        </Button>
      </Field>
    </form>
  )
}
