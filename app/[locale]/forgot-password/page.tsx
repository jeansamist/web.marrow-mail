"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LanguageSwitcher } from "@/components/marketing/language-switcher";
import { cn } from "@/lib/utils";
import { cardShadow, premiumButton } from "@/components/onboarding/styles";
import { forgotPasswordSchema } from "@/schemas/auth.schemas";
import { forgotPassword } from "@/services/auth.services";
import { getErrorStatus } from "@/lib/api-error";

export default function ForgotPasswordPage() {
  const t = useTranslations("ForgotPassword");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setError(t("submitError"));
      return;
    }

    setSubmitting(true);
    const resp = await forgotPassword(parsed.data);
    setSubmitting(false);

    // Show the same "sent" state for a nonexistent account (status 400) as for
    // success, so this flow never reveals whether an email has an account.
    if (resp instanceof Error && getErrorStatus(resp) !== 400) {
      setError(t("submitError"));
      return;
    }

    setSent(true);
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
          {sent ? (
            <div className="flex flex-col items-center py-4 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Mail className="size-6" strokeWidth={2} />
              </span>
              <h1 className="mt-5 text-xl font-bold text-foreground">{t("sentTitle")}</h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t("sentDescription", { email })}
              </p>
              <Button size="lg" className={cn("mt-6 w-full", premiumButton)} asChild>
                <Link href="/sign-in">{t("sentBackCta")}</Link>
              </Button>
              <p className="mt-4 text-sm text-muted-foreground">
                {t("resendPrompt")}{" "}
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="font-medium text-foreground underline hover:text-primary"
                >
                  {t("resendCta")}
                </button>
              </p>
            </div>
          ) : (
            <>
              <span className="font-mono text-xs font-medium uppercase tracking-[0.15em] text-primary">
                {t("eyebrow")}
              </span>
              <h1 className="mt-2 text-xl font-bold text-foreground">{t("title")}</h1>
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

                {error && <p className="text-sm text-destructive">{error}</p>}

                <Button
                  type="submit"
                  size="lg"
                  className={cn("mt-2 w-full", premiumButton)}
                  disabled={submitting}
                >
                  {submitting ? t("submitting") : t("submit")}
                </Button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
