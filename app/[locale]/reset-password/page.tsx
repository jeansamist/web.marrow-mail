"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { AlertCircle, ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LanguageSwitcher } from "@/components/marketing/language-switcher";
import { cn } from "@/lib/utils";
import { cardShadow, premiumButton } from "@/components/onboarding/styles";
import { resetPasswordSchema } from "@/schemas/auth.schemas";
import { resetPassword } from "@/services/auth.services";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordPageInner />
    </Suspense>
  );
}

function ResetPasswordPageInner() {
  const t = useTranslations("ResetPassword");
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const resetPasswordToken = searchParams.get("resetPasswordToken");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [mismatch, setMismatch] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setMismatch(true);
      return;
    }
    setMismatch(false);

    const parsed = resetPasswordSchema.safeParse({
      email,
      resetPasswordToken,
      newPassword: password,
    });
    if (!parsed.success) {
      setError(t("tokenError"));
      return;
    }

    setSubmitting(true);
    const resp = await resetPassword(parsed.data);
    setSubmitting(false);

    if (resp instanceof Error) {
      setError(t("tokenError"));
      return;
    }

    setDone(true);
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
          {!email || !resetPasswordToken ? (
            <div className="flex flex-col items-center py-4 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertCircle className="size-6" strokeWidth={2} />
              </span>
              <h1 className="mt-5 text-xl font-bold text-foreground">{t("invalidLinkTitle")}</h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t("invalidLinkDescription")}
              </p>
              <Button size="lg" className={cn("mt-6 w-full", premiumButton)} asChild>
                <Link href="/forgot-password">{t("invalidLinkCta")}</Link>
              </Button>
            </div>
          ) : done ? (
            <div className="flex flex-col items-center py-4 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Check className="size-6" strokeWidth={2} />
              </span>
              <h1 className="mt-5 text-xl font-bold text-foreground">{t("successTitle")}</h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t("successDescription")}
              </p>
              <Button size="lg" className={cn("mt-6 w-full", premiumButton)} asChild>
                <Link href="/sign-in">{t("successCta")}</Link>
              </Button>
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
                  <label htmlFor="password" className="text-sm font-medium text-foreground">
                    {t("passwordLabel")}
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setMismatch(false);
                    }}
                    placeholder={t("passwordPlaceholder")}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="confirm" className="text-sm font-medium text-foreground">
                    {t("confirmLabel")}
                  </label>
                  <Input
                    id="confirm"
                    name="confirm"
                    type="password"
                    required
                    minLength={8}
                    value={confirm}
                    onChange={(e) => {
                      setConfirm(e.target.value);
                      setMismatch(false);
                    }}
                    placeholder={t("confirmPlaceholder")}
                  />
                </div>

                {mismatch && (
                  <p className="text-sm text-destructive">{t("mismatchError")}</p>
                )}
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
