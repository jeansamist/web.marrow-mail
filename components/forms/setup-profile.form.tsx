"use client"

import { useCurrentLocaleUrl, useI18n } from "@/lib/i18n/client"
import {
  setupMailAccountProfileSchema,
  SetupMailAccountProfileSchema,
} from "@/schemas/auth.schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { FunctionComponent, useState } from "react"
import { useForm } from "react-hook-form"
import { Alert, AlertDescription } from "../ui/alert"
import { Button } from "../ui/button"
import { FieldGroup } from "../ui/field"
import { InputField } from "../ui/fields"

export type SetupProfileFormProps = {
  cuid: string
  domainName: string
  [key: string]: unknown
}

export const SetupProfileForm: FunctionComponent<SetupProfileFormProps> = ({
  cuid,
  domainName,
}) => {
  const [errorMessage, setErrorMessage] = useState<string>()
  const [sent, setSent] = useState(false)
  const t = useI18n()
  const { currentLocaleUrl } = useCurrentLocaleUrl()
  const form = useForm<SetupMailAccountProfileSchema>({
    resolver: zodResolver(setupMailAccountProfileSchema),
    mode: "onChange",
    defaultValues: {
      cuid: cuid,
    },
  })
  const router = useRouter()
  async function onSubmit(data: SetupMailAccountProfileSchema) {
    const result = new Error("not implemented")
    if (result instanceof Error) {
      setErrorMessage(result.message ?? t("unknownError"))
      return
    }
    setErrorMessage(undefined)
  }
  return (
    <div className={"space-y-4 p-0 lg:space-y-6 lg:p-6"}>
      <div className="absolute -bottom-6 left-0 flex h-18 w-full items-center justify-end gap-6 border-t bg-accent px-6 lg:px-8">
        <Button variant={"ghost"}>{t("mail.setup-profile.prev")}</Button>
        <Button>{t("mail.setup-profile.next")}</Button>
      </div>
      <div className="flex gap-4">
        <div className="h-2 flex-1 rounded-full bg-primary"></div>
        <div className="h-2 flex-1 rounded-full bg-accent"></div>
        <div className="h-2 flex-1 rounded-full bg-accent"></div>
      </div>

      <div>
        <h3 className="text-2xl leading-normal font-bold">
          {t("mail.setup-profile.form.update-password.title")}
        </h3>
        <p className="text-sm leading-normal opacity-70">
          {t("mail.setup-profile.form.update-password.description")}
        </p>
      </div>
      <form id="setup-profile-form">
        <FieldGroup className="gap-3">
          {errorMessage && (
            <Alert variant="destructive">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-6">
            <InputField
              formReturn={form}
              label={t(
                "mail.setup-profile.form.update-password.newPassword.label"
              )}
              name="newPassword"
              type="password"
              placeholder={t(
                "mail.setup-profile.form.update-password.newPassword.placeholder"
              )}
            />
            <InputField
              formReturn={form}
              label={t(
                "mail.setup-profile.form.update-password.confirmPassword.label"
              )}
              name="confirmPassword"
              type="password"
              placeholder={t(
                "mail.setup-profile.form.update-password.confirmPassword.placeholder"
              )}
            />
          </div>
        </FieldGroup>
      </form>
    </div>
  )
}
