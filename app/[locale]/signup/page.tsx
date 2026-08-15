"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/navigation";
import { ArrowLeft, Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LanguageSwitcher } from "@/components/marketing/language-switcher";
import {
  OrangeMoneyLogoWhite,
  MtnMoneyLogoWhite,
  VisaLogoWhite,
} from "@/components/marketing/payment-logos";
import { clearAccount, savePendingOwnerName } from "@/lib/onboarding";
import { cn } from "@/lib/utils";
import { cardShadow, premiumButton } from "@/components/onboarding/styles";
import { signUpSchema } from "@/schemas/auth.schemas";
import { signUp } from "@/services/auth.services";
import { getErrorStatus } from "@/lib/api-error";

const paymentLogos = [
  { name: "Orange Money", Logo: OrangeMoneyLogoWhite, className: "h-5 w-auto" },
  { name: "MTN MoMo", Logo: MtnMoneyLogoWhite, className: "h-5 w-auto" },
  { name: "Visa", Logo: VisaLogoWhite, className: "h-5 w-auto" },
];

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupPageInner />
    </Suspense>
  );
}

function SignupPageInner() {
  const t = useTranslations("Signup");
  const router = useRouter();
  const searchParams = useSearchParams();
  const planParam = searchParams.get("plan");
  const points = t.raw("panel.points") as string[];
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const parsed = signUpSchema.safeParse({
      firstName,
      lastName,
      businessName: businessName.trim() || undefined,
      email,
      password,
    });
    if (!parsed.success) {
      setError(t("form.submitError"));
      return;
    }

    setSubmitting(true);
    const resp = await signUp(parsed.data);
    setSubmitting(false);

    if (resp instanceof Error) {
      setError(getErrorStatus(resp) === 409 ? t("form.emailTakenError") : t("form.submitError"));
      return;
    }

    clearAccount();
    savePendingOwnerName(`${firstName} ${lastName}`.trim());
    const verifyEmailHref =
      planParam === "core" || planParam === "plus"
        ? { pathname: "/verify-email" as const, query: { email, plan: planParam } }
        : { pathname: "/verify-email" as const, query: { email } };
    router.push(verifyEmailHref);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/70">
        <div className="container flex h-16 items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            {t("backLabel")}
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {t("signInPrompt")}
            </span>
            <Button variant="outline" size="sm" asChild>
              <Link href="/sign-in">{t("signInCta")}</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
          {/* Left: value panel */}
          <div className="relative hidden overflow-hidden rounded-2xl bg-ink px-8 py-10 text-ink-foreground lg:flex lg:flex-col lg:justify-between lg:p-12">
            <div className="relative">
              <span className="font-mono text-xs font-medium uppercase tracking-[0.15em] text-[#FBB02D]">
                {t("panel.eyebrow")}
              </span>
              <h1 className="mt-4 text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                {t("panel.title")}
              </h1>
              <p className="mt-4 max-w-sm text-ink-foreground/70">
                {t("panel.description")}
              </p>

              <ul className="mt-8 flex flex-col gap-3.5">
                {points.map((point) => (
                  <li key={point} className="flex items-start gap-2.5 text-sm">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-ink-foreground/10">
                      <Check className="size-3 text-ink-foreground" strokeWidth={3} />
                    </span>
                    <span className="text-ink-foreground/85">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative mt-10 flex flex-col gap-6">
              <div className="rounded-2xl border border-ink-foreground/15 bg-ink-foreground/5 p-4">
                <div className="flex gap-0.5 text-[#FBB02D]" aria-hidden>
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className="size-3.5 fill-current" />
                  ))}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-ink-foreground/85">
                  &ldquo;{t("panel.quote")}&rdquo;
                </p>
                <p className="mt-3 text-xs font-medium text-ink-foreground/60">
                  {t("panel.quoteName")} · {t("panel.quoteRole")}
                </p>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <span className="font-mono text-2xl font-semibold tracking-tight">
                    {t("panel.price")}
                  </span>
                  <span className="ml-1 text-sm text-ink-foreground/60">
                    {t("panel.priceSuffix")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {paymentLogos.map(({ name, Logo, className }) => (
                    <span
                      key={name}
                      title={name}
                      className="inline-flex items-center rounded-lg bg-ink-foreground/10 px-2 py-1.5"
                    >
                      <Logo className={className} />
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right: form */}
          <div
            className={cn(
              "mx-auto w-full max-w-md rounded-2xl border border-border bg-card p-8 sm:p-10",
              cardShadow,
            )}
          >
            <>
                <h2 className="text-xl font-bold text-foreground">
                  {t("form.title")}
                </h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {t("form.description")}
                </p>

                <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="firstName" className="text-sm font-medium text-foreground">
                        {t("form.firstNameLabel")}
                      </label>
                      <Input
                        id="firstName"
                        name="firstName"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder={t("form.firstNamePlaceholder")}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="lastName" className="text-sm font-medium text-foreground">
                        {t("form.lastNameLabel")}
                      </label>
                      <Input
                        id="lastName"
                        name="lastName"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder={t("form.lastNamePlaceholder")}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="businessName"
                      className="text-sm font-medium text-foreground"
                    >
                      {t("form.businessNameLabel")}
                    </label>
                    <Input
                      id="businessName"
                      name="businessName"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder={t("form.businessNamePlaceholder")}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="email" className="text-sm font-medium text-foreground">
                      {t("form.emailLabel")}
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("form.emailPlaceholder")}
                    />
                    <p className="text-xs text-muted-foreground">
                      {t("form.emailHint")}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="password"
                      className="text-sm font-medium text-foreground"
                    >
                      {t("form.passwordLabel")}
                    </label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t("form.passwordPlaceholder")}
                    />
                  </div>

                  {error && <p className="text-sm text-destructive">{error}</p>}

                  <Button
                    type="submit"
                    size="lg"
                    className={cn("mt-2 w-full", premiumButton)}
                    disabled={submitting}
                  >
                    {submitting ? t("form.submitting") : t("form.submit")}
                  </Button>

                  <p className="text-center text-xs text-muted-foreground">
                    {t.rich("form.terms", {
                      terms: (chunks) => (
                        <Link href="/terms" className="underline hover:text-foreground">
                          {chunks}
                        </Link>
                      ),
                      privacy: (chunks) => (
                        <Link href="/privacy" className="underline hover:text-foreground">
                          {chunks}
                        </Link>
                      ),
                    })}
                  </p>
                </form>
              </>
          </div>
        </div>
      </main>
    </div>
  );
}
