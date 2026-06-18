import { MailboxAccessForm } from "@/components/mailbox-access-form"
import { Button } from "@/components/ui/button"
import { getI18n, getStaticParams, setStaticParamsLocale } from "@/lib/i18n/server"
import { Mail } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export function generateStaticParams() {
  return getStaticParams()
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  setStaticParamsLocale(locale)
  const t = await getI18n()

  return (
    <div className="flex min-h-screen flex-col bg-primary text-primary-foreground">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-4 md:px-10">
        <Image
          src="/Marrowmaill-Logo-White.svg"
          alt="Marrow Mail"
          width={140}
          height={52}
        />
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild className="text-primary-foreground hover:bg-primary-foreground/10">
            <Link href={`/${locale}/auth/sign-in`}>{t("auth.signIn.submit")}</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href={`/${locale}/auth/sign-up`}>{t("auth.signUp.submit")}</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center gap-10 px-6 py-16 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold leading-tight md:text-6xl">
            {t("common.app-name")}
          </h1>
          <p className="mx-auto max-w-lg text-base leading-relaxed opacity-80 md:text-lg">
            {t("home.ready.description")}
          </p>
        </div>

        {/* Mailbox access card */}
        <div className="w-full max-w-md rounded-2xl bg-background p-6 text-foreground shadow-xl">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary">
              <Mail className="size-5 text-primary-foreground" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold">My Mailbox</p>
              <p className="text-xs text-muted-foreground">Enter your domain to access your inbox</p>
            </div>
          </div>
          <MailboxAccessForm />
        </div>

        {/* Secondary links */}
        <div className="flex flex-col items-center gap-2 text-sm opacity-70">
          <p>
            Don&apos;t have an account?{" "}
            <Link href={`/${locale}/auth/sign-up`} className="underline underline-offset-2 hover:opacity-100">
              Get started
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}
