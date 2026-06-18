import { LandingFaq } from "@/components/landing-faq"
import { MailboxAccessForm } from "@/components/mailbox-access-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { getI18n, getStaticParams, setStaticParamsLocale } from "@/lib/i18n/server"
import {
  ArrowRight,
  Check,
  Globe,
  Inbox,
  Lock,
  MailOpen,
  Shield,
  Sparkles,
  Users,
  Zap,
} from "lucide-react"
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
    { icon: Globe, title: t("landing.features.domain.title"), description: t("landing.features.domain.description") },
    { icon: Shield, title: t("landing.features.privacy.title"), description: t("landing.features.privacy.description") },
    { icon: Zap, title: t("landing.features.setup.title"), description: t("landing.features.setup.description") },
    { icon: Inbox, title: t("landing.features.inbox.title"), description: t("landing.features.inbox.description") },
    { icon: MailOpen, title: t("landing.features.aliases.title"), description: t("landing.features.aliases.description") },
    { icon: Users, title: t("landing.features.team.title"), description: t("landing.features.team.description") },
  ]

  const steps = [
    { num: t("landing.how.step1.number"), title: t("landing.how.step1.title"), desc: t("landing.how.step1.description") },
    { num: t("landing.how.step2.number"), title: t("landing.how.step2.title"), desc: t("landing.how.step2.description") },
    { num: t("landing.how.step3.number"), title: t("landing.how.step3.title"), desc: t("landing.how.step3.description") },
    { num: t("landing.how.step4.number"), title: t("landing.how.step4.title"), desc: t("landing.how.step4.description") },
  ]

  const plans = [
    {
      name: t("landing.pricing.free.name"),
      price: t("landing.pricing.free.price"),
      description: t("landing.pricing.free.description"),
      features: [
        t("landing.pricing.free.f1"),
        t("landing.pricing.free.f2"),
        t("landing.pricing.free.f3"),
        t("landing.pricing.free.f4"),
        t("landing.pricing.free.f5"),
      ],
      popular: false,
    },
    {
      name: t("landing.pricing.starter.name"),
      price: t("landing.pricing.starter.price"),
      description: t("landing.pricing.starter.description"),
      features: [
        t("landing.pricing.starter.f1"),
        t("landing.pricing.starter.f2"),
        t("landing.pricing.starter.f3"),
        t("landing.pricing.starter.f4"),
        t("landing.pricing.starter.f5"),
      ],
      popular: true,
    },
    {
      name: t("landing.pricing.business.name"),
      price: t("landing.pricing.business.price"),
      description: t("landing.pricing.business.description"),
      features: [
        t("landing.pricing.business.f1"),
        t("landing.pricing.business.f2"),
        t("landing.pricing.business.f3"),
        t("landing.pricing.business.f4"),
        t("landing.pricing.business.f5"),
      ],
      popular: false,
    },
  ]

  const testimonials = [
    { quote: t("landing.testimonials.1.quote"), name: t("landing.testimonials.1.name"), role: t("landing.testimonials.1.role") },
    { quote: t("landing.testimonials.2.quote"), name: t("landing.testimonials.2.name"), role: t("landing.testimonials.2.role") },
    { quote: t("landing.testimonials.3.quote"), name: t("landing.testimonials.3.name"), role: t("landing.testimonials.3.role") },
  ]

  const faqItems = [
    { q: t("landing.faq.q1"), a: t("landing.faq.a1") },
    { q: t("landing.faq.q2"), a: t("landing.faq.a2") },
    { q: t("landing.faq.q3"), a: t("landing.faq.a3") },
    { q: t("landing.faq.q4"), a: t("landing.faq.a4") },
    { q: t("landing.faq.q5"), a: t("landing.faq.a5") },
  ]

  const footerLinks = {
    [t("landing.footer.product")]: [
      { label: t("landing.footer.features"), href: "#features" },
      { label: t("landing.footer.pricing"), href: "#pricing" },
      { label: t("landing.footer.changelog"), href: "#" },
    ],
    [t("landing.footer.company")]: [
      { label: t("landing.footer.about"), href: "#" },
      { label: t("landing.footer.blog"), href: "#" },
      { label: t("landing.footer.contact"), href: "#" },
    ],
    [t("landing.footer.legal")]: [
      { label: t("landing.footer.privacy"), href: "#" },
      { label: t("landing.footer.terms"), href: "#" },
    ],
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Nav ──────────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Image
            src="/Marrowmaill-Logo-White.svg"
            alt={t("common.app-name")}
            width={130}
            height={48}
            priority
            className="dark:invert-0 invert"
          />
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            <Link href="#features" className="hover:text-foreground transition-colors">{t("landing.nav.features")}</Link>
            <Link href="#pricing" className="hover:text-foreground transition-colors">{t("landing.nav.pricing")}</Link>
            <Link href="#faq" className="hover:text-foreground transition-colors">{t("landing.nav.docs")}</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/${locale}/auth/sign-in`}>{t("landing.nav.sign-in")}</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href={`/${locale}/auth/sign-up`}>{t("landing.nav.get-started")}</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="mx-auto flex max-w-4xl flex-col items-center gap-8 px-6 py-24 text-center md:py-36">
        <Badge variant="secondary" className="gap-1.5">
          <Sparkles className="size-3" />
          {t("landing.hero.badge")}
        </Badge>
        <h1 className="text-5xl font-bold leading-tight tracking-tight md:text-7xl">
          {t("landing.hero.title")}
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
          {t("landing.hero.description")}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" asChild>
            <Link href={`/${locale}/auth/sign-up`}>
              {t("landing.hero.cta.primary")}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="#pricing">{t("landing.hero.cta.secondary")}</Link>
          </Button>
        </div>
      </section>

      {/* ── Trust bar ────────────────────────────────────────────────────────── */}
      <div className="border-y bg-muted/40 py-5 text-center text-sm text-muted-foreground">
        {t("landing.trust.label")}
      </div>

      {/* ── Mailbox access ───────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="flex flex-col items-center gap-6 rounded-2xl border bg-card p-8 text-center shadow-sm md:flex-row md:gap-12 md:text-left">
          <div className="flex-1 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">{t("landing.mailbox.eyebrow")}</p>
            <h2 className="text-2xl font-bold">{t("landing.mailbox.title")}</h2>
            <p className="text-sm text-muted-foreground">{t("landing.mailbox.description")}</p>
          </div>
          <div className="w-full max-w-sm">
            <MailboxAccessForm />
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────────── */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">{t("landing.features.eyebrow")}</p>
          <h2 className="text-3xl font-bold md:text-4xl">
            {t("landing.features.title").split("\n").map((line, i) => (
              <span key={i}>{line}{i === 0 && <br />}</span>
            ))}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">{t("landing.features.description")}</p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border bg-card p-6 transition-shadow hover:shadow-md">
              <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <f.icon className="size-5" />
              </div>
              <h3 className="mb-1 font-semibold">{f.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────────── */}
      <section className="border-y bg-muted/30 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">{t("landing.how.eyebrow")}</p>
            <h2 className="text-3xl font-bold md:text-4xl">{t("landing.how.title")}</h2>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <div key={i} className="flex flex-col gap-3">
                <span className="text-4xl font-black text-primary/20">{s.num}</span>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────────── */}
      <section id="pricing" className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-14 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">{t("landing.pricing.eyebrow")}</p>
          <h2 className="text-3xl font-bold md:text-4xl">{t("landing.pricing.title")}</h2>
          <p className="mt-3 text-muted-foreground">{t("landing.pricing.description")}</p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl border p-6 ${plan.popular ? "border-primary shadow-lg" : "bg-card"}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  {t("landing.pricing.popular")}
                </Badge>
              )}
              <div className="mb-6">
                <p className="font-semibold">{plan.name}</p>
                <div className="mt-2 flex items-end gap-1">
                  <span className="text-4xl font-black">${plan.price}</span>
                  <span className="mb-1 text-sm text-muted-foreground">{t("landing.pricing.period")}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
              </div>
              <ul className="mb-8 flex-1 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="size-4 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button variant={plan.popular ? "default" : "outline"} asChild>
                <Link href={`/${locale}/auth/sign-up`}>{t("landing.pricing.cta")}</Link>
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────────── */}
      <section className="border-y bg-muted/30 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">{t("landing.testimonials.eyebrow")}</p>
            <h2 className="text-3xl font-bold md:text-4xl">{t("landing.testimonials.title")}</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.map((t_) => (
              <blockquote key={t_.name} className="flex flex-col gap-4 rounded-xl border bg-card p-6">
                <p className="flex-1 text-sm leading-relaxed text-muted-foreground">"{t_.quote}"</p>
                <footer>
                  <p className="text-sm font-semibold">{t_.name}</p>
                  <p className="text-xs text-muted-foreground">{t_.role}</p>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────────── */}
      <section id="faq" className="mx-auto max-w-3xl px-6 py-20">
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">{t("landing.faq.eyebrow")}</p>
          <h2 className="text-3xl font-bold md:text-4xl">{t("landing.faq.title")}</h2>
        </div>
        <LandingFaq items={faqItems} />
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────────── */}
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-24 text-center">
          <h2 className="text-3xl font-bold md:text-5xl">{t("landing.cta.title")}</h2>
          <p className="max-w-lg text-base opacity-80">{t("landing.cta.description")}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button size="lg" variant="secondary" asChild>
              <Link href={`/${locale}/auth/sign-up`}>
                {t("landing.cta.primary")}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
              <Link href="#">{t("landing.cta.secondary")}</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="border-t bg-muted/20">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
            <div className="col-span-2 md:col-span-1">
              <Image
                src="/Marrowmaill-Logo-White.svg"
                alt={t("common.app-name")}
                width={120}
                height={44}
                className="mb-3 dark:invert-0 invert"
              />
              <p className="max-w-48 text-xs leading-relaxed text-muted-foreground">
                {t("landing.footer.tagline")}
              </p>
            </div>
            {Object.entries(footerLinks).map(([section, links]) => (
              <div key={section}>
                <p className="mb-4 text-xs font-semibold uppercase tracking-widest">{section}</p>
                <ul className="space-y-2">
                  {links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <Separator className="my-8" />
          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} {t("common.app-name")}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
