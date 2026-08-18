"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { AlertCircle, Check } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LanguageSwitcher } from "@/components/marketing/language-switcher";
import { cn } from "@/lib/utils";
import { cardShadow, premiumButton } from "@/components/onboarding/styles";
import { setupMailAccountProfile } from "@/services/mail.services";

export default function SetupMailAccountProfilePage() {
  return (
    <Suspense fallback={null}>
      <SetupMailAccountProfilePageInner />
    </Suspense>
  );
}

function SetupMailAccountProfilePageInner() {
  const t = useTranslations("AcceptInvite");
  const params = useParams<{ domain: string }>();
  const domain = decodeURIComponent(params.domain ?? "");
  const searchParams = useSearchParams();
  const cuid = searchParams.get("cuid") ?? "";
  const valid = Boolean(domain && cuid);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [mailboxEmail, setMailboxEmail] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(t("passwordMismatch"));
      return;
    }

    setSubmitting(true);
    const resp = await setupMailAccountProfile({
      firstName,
      lastName,
      avatar: null,
      cuid,
      newPassword: password,
      confirmPassword,
    });
    setSubmitting(false);

    if (resp instanceof Error) {
      setError(t("setupFailed"));
      return;
    }

    setMailboxEmail(resp.email);
    setDone(true);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/70">
        <div className="container flex h-16 items-center justify-between">
          <Link
            href="/"
            className="text-lg font-semibold tracking-tight text-foreground"
          >
            Marrow<span className="text-primary">mail</span>
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
          {!valid ? (
            <div className="flex flex-col items-center py-4 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertCircle className="size-6" strokeWidth={2} />
              </span>
              <h1 className="mt-5 text-xl font-bold text-foreground">
                {t("invalidTitle")}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t("invalidDescription")}
              </p>
            </div>
          ) : done ? (
            <div className="flex flex-col items-center py-4 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Check className="size-6" strokeWidth={2} />
              </span>
              <h1 className="mt-5 text-xl font-bold text-foreground">
                {t("successTitle")}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t("successDescription", { email: mailboxEmail })}
              </p>
              <Button size="lg" className={cn("mt-6 w-full", premiumButton)} asChild>
                <Link href={`/team-login/${domain}`}>{t("successCta")}</Link>
              </Button>
            </div>
          ) : (
            <>
              <span className="font-mono text-xs font-medium uppercase tracking-[0.15em] text-primary">
                {t("eyebrow")}
              </span>
              <h1 className="mt-2 text-xl font-bold text-foreground">
                {t("title", { domain })}
              </h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {t("genericDescription")}
              </p>

              <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="firstName" className="text-sm font-medium text-foreground">
                      {t("firstNameLabel")}
                    </label>
                    <Input
                      id="firstName"
                      name="firstName"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder={t("firstNamePlaceholder")}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="lastName" className="text-sm font-medium text-foreground">
                      {t("lastNameLabel")}
                    </label>
                    <Input
                      id="lastName"
                      name="lastName"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder={t("lastNamePlaceholder")}
                    />
                  </div>
                </div>

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
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("passwordPlaceholder")}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                    {t("confirmPasswordLabel")}
                  </label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t("confirmPasswordPlaceholder")}
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
