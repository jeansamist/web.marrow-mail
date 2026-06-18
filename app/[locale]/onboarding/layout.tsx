import { OnboardingSteps } from "@/components/onboarding-steps"
import { OnboardingProvider } from "@/contexts/onboarding.context"
import { getI18n, getStaticParams, setStaticParamsLocale } from "@/lib/i18n/server"
import Image from "next/image"

export function generateStaticParams() {
  return getStaticParams()
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setStaticParamsLocale(locale)
  const t = await getI18n()
  const STEPS = [
    {
      title: t("onboarding.steps.domain.title"),
      description: t("onboarding.steps.domain.description"),
    },
    {
      title: t("onboarding.steps.dns.title"),
      description: t("onboarding.steps.dns.description"),
    },
    {
      title: t("onboarding.steps.email.title"),
      description: t("onboarding.steps.email.description"),
    },
    {
      title: t("onboarding.steps.pay.title"),
      description: t("onboarding.steps.pay.description"),
    },
    {
      title: t("onboarding.steps.success.title"),
      description: t("onboarding.steps.success.description"),
    },
  ]
  return (
    <OnboardingProvider steps={STEPS}>
      <main className="flex min-h-screen flex-col bg-primary p-4 md:h-screen md:flex-row md:justify-center md:p-2">
        {/* Mobile: logo + horizontal stepper */}
        <div className="mb-4 flex flex-col gap-4 md:hidden">
          <Image
            src={"/Marrowmaill-Logo-White.svg"}
            alt="Marrowmail Logo"
            width={140}
            height={53}
          />
        </div>

        {/* Content */}
        <div className="flex-1 rounded-lg bg-background p-4 py-8 md:py-36">
          <div className="mx-auto max-w-3xl">{children}</div>
        </div>

        {/* Desktop: side panel */}
        <div className="hidden max-w-lg flex-col justify-end gap-4 rounded-lg bg-primary text-primary-foreground md:flex">
          <Image
            src={"/Marrowmaill-Logo-White.svg"}
            alt="Marrowmail Logo"
            className="mx-6"
            width={200}
            height={75}
          />
          <div className="px-6">
            <h3 className="text-2xl leading-normal font-bold">
              Setup Marrow Mail in easy steps
            </h3>
            <p className="text-sm leading-normal opacity-70">
              Register your domain, create your email address, and start sending
              emails in minutes with Marrow Mail. Our user-friendly interface
              and comprehensive documentation make it easy to get started, even
              if you&apos;re new to email hosting.
            </p>
          </div>
          <OnboardingSteps />
        </div>
      </main>
    </OnboardingProvider>
  )
}
