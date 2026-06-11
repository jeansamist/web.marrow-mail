"use client"

import { useAuth } from "@/contexts/auth.context"
import { useOnboarding } from "@/contexts/onboarding.context"
import { useCurrentLocaleUrl, useI18n } from "@/lib/i18n/client"
import {
  onboardingCreateEmailSchema,
  OnboardingCreateEmailSchema,
} from "@/schemas/onboarding.schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, LoaderCircle, Plus, Trash } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FunctionComponent, useEffect, useState } from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { Alert, AlertDescription } from "../ui/alert"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "../ui/input-group"

export type OnboardingCreateEmailFormProps = {
  domainParams: string
  [key: string]: unknown
}

export const OnboardingCreateEmailForm: FunctionComponent<
  OnboardingCreateEmailFormProps
> = ({ domainParams }) => {
  const onboarding = useOnboarding()
  const auth = useAuth()
  const form = useForm<OnboardingCreateEmailSchema>({
    resolver: zodResolver(onboardingCreateEmailSchema),
    mode: "onChange",
    defaultValues: {
      data: [
        {
          username: auth.user
            ? `${auth.user.firstName.toLowerCase()}.${auth.user.lastName.toLowerCase()}`
            : "",
          owner: auth.user?.email,
        },
      ],
    },
  })
  const [errorMessage, setErrorMessage] = useState<string>()
  const t = useI18n()
  const { currentLocaleUrl } = useCurrentLocaleUrl()
  const router = useRouter()
  const { fields, remove, append } = useFieldArray({
    control: form.control,
    name: "data",
  })
  // Check if the domain in the context matches the domain in the URL params
  useEffect(() => {
    const contextStepValues = onboarding.steps[0].values as
      | { domain?: string }
      | undefined
    const contextDomain = contextStepValues?.domain
    if (contextDomain && contextDomain !== domainParams) {
      // If they don't match, redirect to the correct URL with the domain from the context
      router.push(currentLocaleUrl(`/onboarding/`))
    }
  }, [currentLocaleUrl, domainParams, onboarding.steps, router])

  // Update the context current step
  useEffect(() => {
    onboarding.setCurrentStep(2)
  }, [onboarding])

  const onSubmit = async (data: OnboardingCreateEmailSchema) => {}
  return (
    <>
      <form
        id="create-email-form"
        className="space-y-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <Card>
          <CardContent className="space-y-4">
            <FieldGroup>
              {errorMessage && (
                <Alert variant="destructive">
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}
              {/* <FieldGroup>
        <div className="grid grid-cols-2 gap-4">
          <Field data-invalid={!!form.formState.errors.data?.[0]?.username}>
            <FieldLabel>Username</FieldLabel>
            <InputGroup>
              <InputGroupInput {...form.register(`data.${0}.username`)} />
              <InputGroupAddon align="inline-end">
                <InputGroupText>@{domainParams}</InputGroupText>
              </InputGroupAddon>
            </InputGroup>
            <FieldError errors={[form.formState.errors.data?.[0]?.username]} />
          </Field>
          <Field data-invalid={!!form.formState.errors.data?.[0]?.owner}>
            <FieldLabel>Owner email</FieldLabel>
            <InputGroup>
              <InputGroupInput {...form.register(`data.${0}.owner`)} />
            </InputGroup>
            <FieldError errors={[form.formState.errors.data?.[0]?.owner]} />
          </Field>
        </div>
      </FieldGroup> */}
              {fields.map((field, key) => (
                <div className="flex items-end gap-4" key={key}>
                  <div className="grid flex-1 grid-cols-2 gap-4">
                    <Field
                      data-invalid={
                        !!form.formState.errors.data?.[key]?.username
                      }
                    >
                      <FieldLabel>Username</FieldLabel>
                      <InputGroup>
                        <InputGroupInput
                          {...form.register(`data.${key}.username`)}
                        />
                        <InputGroupAddon align="inline-end">
                          <InputGroupText>@{domainParams}</InputGroupText>
                        </InputGroupAddon>
                      </InputGroup>
                      <FieldError
                        errors={[form.formState.errors.data?.[key]?.username]}
                      />
                    </Field>
                    <Field
                      data-invalid={!!form.formState.errors.data?.[key]?.owner}
                    >
                      <FieldLabel>Owner email</FieldLabel>
                      <InputGroup>
                        <InputGroupInput
                          {...form.register(`data.${key}.owner`)}
                        />
                      </InputGroup>
                      <FieldError
                        errors={[form.formState.errors.data?.[key]?.owner]}
                      />
                    </Field>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size={"icon"}
                    onClick={() => remove(key)}
                  >
                    <Trash />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                onClick={() => append({ username: "", owner: "" })}
                className="w-full"
                variant={"secondary"}
              >
                <Plus /> Add one more
              </Button>
            </FieldGroup>
          </CardContent>
        </Card>
        <Field orientation="horizontal">
          <Button variant={"outline"} asChild>
            <Link
              href={currentLocaleUrl(
                `/onboarding/configure-dns?domain=${domainParams}`
              )}
            >
              <ArrowLeft />
              Go back
            </Link>
          </Button>
          <Button
            type="submit"
            disabled={!form.formState.isValid || form.formState.isSubmitting}
            form="create-email-form"
          >
            Continue
            {form.formState.isSubmitting && (
              <LoaderCircle className="animate-spin" />
            )}
          </Button>
        </Field>
      </form>
    </>
  )
}
