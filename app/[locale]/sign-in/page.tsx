"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { AlertCircle, ArrowLeft, Check, ShieldCheck, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { LanguageSwitcher } from "@/components/marketing/language-switcher";
import { hasCompletedOnboardingOnServer } from "@/lib/onboarding";
import { cn } from "@/lib/utils";
import { cardShadow, premiumButton } from "@/components/onboarding/styles";
import { signInSchema } from "@/schemas/auth.schemas";
import { signIn } from "@/services/auth.services";
import { getErrorStatus } from "@/lib/api-error";

export default function SignInPage() {
  const t = useTranslations("SignIn");
  const points = t.raw("panel.points") as string[];
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [unverified, setUnverified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setUnverified(false);

    const parsed = signInSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(t("invalidCredentialsError"));
      return;
    }

    setSubmitting(true);
    const resp = await signIn(parsed.data);
    setSubmitting(false);

    if (resp instanceof Error) {
      if (getErrorStatus(resp) === 403) {
        setUnverified(true);
      } else {
        setError(t("invalidCredentialsError"));
      }
      return;
    }

    const completed = await hasCompletedOnboardingOnServer();
    router.push(completed ? "/dashboard" : "/onboarding");
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
              {t("signUpPrompt")}
            </span>
            <Button variant="outline" size="sm" asChild>
              <Link href="/signup">{t("signUpCta")}</Link>
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
              <p className="mt-4 max-w-sm text-ink-foreground/70">{t("panel.description")}</p>

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
                    {t("panel.stat")}
                  </span>
                  <span className="ml-1 text-sm text-ink-foreground/60">
                    {t("panel.statLabel")}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 rounded-lg bg-ink-foreground/10 px-2.5 py-1.5 text-ink-foreground/80">
                  <ShieldCheck className="size-3.5" strokeWidth={1.5} />
                  <span className="text-xs font-medium">{t("panel.secureBadge")}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: form */}
          <div
            className={cn(
              "mx-auto flex w-full max-w-md flex-col justify-center rounded-2xl border border-border bg-card p-8 sm:p-10",
              cardShadow,
            )}
          >
            {unverified ? (
              <div className="flex flex-col items-center py-4 text-center">
                <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <AlertCircle className="size-6" strokeWidth={2} />
                </span>
                <h1 className="mt-5 text-xl font-bold text-foreground">{t("unverifiedTitle")}</h1>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t("unverifiedDescription", { email })}
                </p>
                <Button size="lg" className={cn("mt-6 w-full", premiumButton)} asChild>
                  <Link href={{ pathname: "/verify-email", query: { email } }}>
                    {t("unverifiedCta")}
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                <span className="font-mono text-xs font-medium uppercase tracking-[0.15em] text-primary">
                  {t("eyebrow")}
                </span>
                <h2 className="mt-2 text-xl font-bold text-foreground">{t("title")}</h2>
                <p className="mt-1.5 text-sm text-muted-foreground">{t("description")}</p>

                <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="email" className="text-sm font-medium text-foreground">
                      {t("emailLabel")}
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("emailPlaceholder")}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label htmlFor="password" className="text-sm font-medium text-foreground">
                        {t("passwordLabel")}
                      </label>
                      <Link
                        href="/forgot-password"
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        {t("forgotPassword")}
                      </Link>
                    </div>
                    <PasswordInput
                      id="password"
                      name="password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t("passwordPlaceholder")}
                    />
                  </div>

                  {error && <p className="text-sm text-destructive">{error}</p>}

                  <Button
                    type="submit"
                    size="lg"
                    className={cn("mt-2 w-full", premiumButton)}
                    disabled={submitting}
                  >
                    {submitting ? t("submitting") : t("submit")}
                  </Button>

                  <p className="text-center text-xs text-muted-foreground">
                    {t.rich("terms", {
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
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
