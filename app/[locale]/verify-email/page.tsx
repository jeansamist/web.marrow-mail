"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/navigation";
import { ArrowLeft, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LanguageSwitcher } from "@/components/marketing/language-switcher";
import { cn } from "@/lib/utils";
import { cardShadow, premiumButton } from "@/components/onboarding/styles";
import { verifyEmailSchema } from "@/schemas/auth.schemas";
import { verifyEmail } from "@/services/auth.services";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailPageInner />
    </Suspense>
  );
}

function VerifyEmailPageInner() {
  const t = useTranslations("VerifyEmail");
  const searchParams = useSearchParams();
  const router = useRouter();
  const planParam = searchParams.get("plan");
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const parsed = verifyEmailSchema.safeParse({ email, emailVerificationCode: code });
    if (!parsed.success) {
      setError(t("invalidCodeError"));
      return;
    }

    setSubmitting(true);
    const resp = await verifyEmail(parsed.data);
    setSubmitting(false);

    if (resp instanceof Error) {
      setError(t("invalidCodeError"));
      return;
    }

    router.push(
      planParam === "core" || planParam === "plus"
        ? { pathname: "/onboarding", query: { plan: planParam } }
        : "/onboarding",
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/70">
        <div className="container flex h-16 items-center justify-between">
          <Link
            href="/sign-in"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            {t("backLabel")}
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="container flex min-h-[calc(100vh-4rem)] items-center justify-center py-12">
        <div
          className={cn(
            "w-full max-w-md rounded-2xl border border-border bg-card p-8 sm:p-10",
            cardShadow,
          )}
        >
          <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MailCheck className="size-6" strokeWidth={2} />
          </span>
          <h1 className="mt-5 text-xl font-bold text-foreground">{t("title")}</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {t("description", { email: email || t("codeLabel") })}
          </p>

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
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="code" className="text-sm font-medium text-foreground">
                {t("codeLabel")}
              </label>
              <Input
                id="code"
                name="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder={t("codePlaceholder")}
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
              {t.rich("backToSignupCta", {
                link: (chunks) => (
                  <Link href="/signup" className="font-medium text-foreground underline">
                    {chunks}
                  </Link>
                ),
              })}
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
