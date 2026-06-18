import { MailboxAccessForm } from "@/components/mailbox-access-form"
import { Button } from "@/components/ui/button"
import { getI18n, getStaticParams, setStaticParamsLocale } from "@/lib/i18n/server"
import { Lock, Mail, Zap } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export function generateStaticParams() {
  return getStaticParams()
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setStaticParamsLocale(locale)
  const t = await getI18n()

  const features = [
    {
      icon: <Mail className="size-5" />,
      title: t("home.features.own.title"),
      description: t("home.features.own.description"),
    },
    {
      icon: <Lock className="size-5" />,
      title: t("home.features.secure.title"),
      description: t("home.features.secure.description"),
    },
    {
      icon: <Zap className="size-5" />,
      title: t("home.features.simple.title"),
      description: t("home.features.simple.description"),
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-primary text-primary-foreground">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-5 md:px-12">
        <Image
          src="/Marrowmaill-Logo-White.svg"
          alt={t("common.app-name")}
          width={140}
          height={52}
          priority
        />
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            asChild
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <Link href={`/${locale}/auth/sign-in`}>{t("home.nav.sign-in")}</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href={`/${locale}/auth/sign-up`}>{t("home.cta.get-started")}</Link>
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-16 px-6 py-16">
        {/* Hero */}
        <div className="flex flex-col items-center gap-6 text-center">
          <h1 className="whitespace-pre-line text-5xl font-bold leading-tight tracking-tight md:text-7xl">
            {t("home.hero.title")}
          </h1>
          <p className="mx-auto max-w-xl text-base leading-relaxed opacity-75 md:text-lg">
            {t("home.hero.description")}
          </p>
          <div className="flex flex-col items-center gap-4 pt-2">
            <Button size="lg" variant="secondary" asChild>
              <Link href={`/${locale}/auth/sign-up`}>{t("home.cta.get-started")}</Link>
            </Button>
            <p className="text-sm opacity-60">
              {t("home.cta.no-account")}{" "}
              <Link
                href={`/${locale}/auth/sign-up`}
                className="underline underline-offset-2 opacity-100 hover:opacity-80"
              >
                {t("home.cta.get-started")}
              </Link>
            </p>
          </div>
        </div>

        {/* Mailbox access card */}
        <div className="w-full max-w-md rounded-2xl bg-background p-6 text-foreground shadow-2xl">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary">
              <Mail className="size-5 text-primary-foreground" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold">{t("home.mailbox.title")}</p>
              <p className="text-xs text-muted-foreground">{t("home.mailbox.description")}</p>
            </div>
          </div>
          <MailboxAccessForm />
        </div>

        {/* Features */}
        <div className="grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="flex flex-col gap-2 rounded-xl bg-primary-foreground/5 p-5 text-left"
            >
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary-foreground/10">
                {f.icon}
              </div>
              <p className="text-sm font-semibold">{f.title}</p>
              <p className="text-xs leading-relaxed opacity-65">{f.description}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="py-6 text-center text-xs opacity-40">
        © {new Date().getFullYear()} {t("common.app-name")}
      </footer>
    </div>
  )
}
