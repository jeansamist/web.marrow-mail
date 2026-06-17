"use client"

import { useCurrentLocaleUrl, useI18n } from "@/lib/i18n/client"
import {
  setupMailAccountProfileSchema,
  SetupMailAccountProfileSchema,
} from "@/schemas/auth.schemas"
import { zodResolver } from "@hookform/resolvers/zod"
import { AnimatePresence, motion } from "motion/react"
import { useRouter } from "next/navigation"
import { FunctionComponent, useState } from "react"
import { Path, useForm } from "react-hook-form"
import { Alert, AlertDescription } from "../ui/alert"
import { Button } from "../ui/button"
import { FieldGroup } from "../ui/field"
import { InputField } from "../ui/fields"

const STEP_COUNT = 3

const stepFields: Path<SetupMailAccountProfileSchema>[][] = [
  ["newPassword", "confirmPassword"],
  ["firstName", "lastName"],
]

const slideVariants = {
  enter: (dir: number) => ({ x: dir * 30, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir * -30, opacity: 0 }),
}

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
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const t = useI18n()
  const { currentLocaleUrl } = useCurrentLocaleUrl()
  const form = useForm<SetupMailAccountProfileSchema>({
    resolver: zodResolver(setupMailAccountProfileSchema),
    mode: "onChange",
    defaultValues: {
      cuid: cuid,
      avatar: null,
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
    setDirection(1)
    setStep(2)
  }

  async function handleNext() {
    if (step === STEP_COUNT - 2) {
      const allValid = await form.trigger()
      if (!allValid) {
        const firstError = Object.values(form.formState.errors)[0]
        setErrorMessage(firstError?.message ?? t("unknownError"))
        return
      }
      form.handleSubmit(onSubmit)()
      return
    }
    const valid = await form.trigger(stepFields[step])
    if (!valid) return
    setErrorMessage(undefined)
    setDirection(1)
    setStep((s) => s + 1)
  }

  function handlePrev() {
    setErrorMessage(undefined)
    setDirection(-1)
    setStep((s) => s - 1)
  }

  const isLastFormStep = step === STEP_COUNT - 2
  const isSuccess = step === STEP_COUNT - 1

  return (
    <div className={"space-y-4 p-0 lg:space-y-6 lg:p-6"}>
      {!isSuccess && (
        <div className="absolute -bottom-6 left-0 flex h-18 w-full items-center justify-end gap-6 border-t bg-accent px-6 lg:px-8">
          <Button variant={"ghost"} onClick={handlePrev} disabled={step === 0}>
            {t("mail.setup-profile.prev")}
          </Button>
          <Button onClick={handleNext}>
            {isLastFormStep
              ? t("mail.setup-profile.submit")
              : t("mail.setup-profile.next")}
          </Button>
        </div>
      )}
      <div className="flex gap-4">
        {Array.from({ length: STEP_COUNT }).map((_, i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-accent"}`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        {step === 0 && (
          <motion.div
            key="step-password"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: "easeInOut" }}
          >
            <div>
              <h3 className="text-2xl leading-normal font-bold">
                {t("mail.setup-profile.form.update-password.title")}
              </h3>
              <p className="text-sm leading-normal opacity-70">
                {t("mail.setup-profile.form.update-password.description")}
              </p>
            </div>
            <form id="setup-profile-form" className="mt-4 lg:mt-6">
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
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="step-profile"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: "easeInOut" }}
          >
            <div>
              <h3 className="text-2xl leading-normal font-bold">
                {t("mail.setup-profile.form.update-profile.title")}
              </h3>
              <p className="text-sm leading-normal opacity-70">
                {t("mail.setup-profile.form.update-profile.description")}
              </p>
            </div>
            <form id="setup-profile-form" className="mt-4 lg:mt-6">
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
                      "mail.setup-profile.form.update-profile.firstName.label"
                    )}
                    name="firstName"
                    placeholder={t(
                      "mail.setup-profile.form.update-profile.firstName.placeholder"
                    )}
                  />
                  <InputField
                    formReturn={form}
                    label={t(
                      "mail.setup-profile.form.update-profile.lastName.label"
                    )}
                    name="lastName"
                    placeholder={t(
                      "mail.setup-profile.form.update-profile.lastName.placeholder"
                    )}
                  />
                </div>
              </FieldGroup>
            </form>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step-success"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="flex flex-col items-center justify-center py-12 text-center space-y-4"
          >
            <h3 className="text-2xl leading-normal font-bold">
              {t("mail.setup-profile.success.title")}
            </h3>
            <p className="text-sm leading-normal opacity-70">
              {t("mail.setup-profile.success.description")}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
