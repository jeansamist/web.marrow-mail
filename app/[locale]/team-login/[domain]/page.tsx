"use client";

import { useEffect, useState, type CSSProperties, type FormEvent } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { AlertCircle, Building2 } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { LanguageSwitcher } from "@/components/marketing/language-switcher";
import { cn } from "@/lib/utils";
import { cardShadow, premiumButton } from "@/components/onboarding/styles";
import { loginMailAccount, verifyMailAccountTwoFactor } from "@/services/mail.services";
import { getPublicDomainBranding } from "@/services/domain.services";
import type { PublicDomainBranding } from "@/types";

export default function TeamLoginPage() {
  const t = useTranslations("TeamLogin");
  const router = useRouter();
  const params = useParams<{ domain: string }>();
  const domain = decodeURIComponent(params.domain ?? "");

  const [checked, setChecked] = useState(false);
  const [branding, setBranding] = useState<PublicDomainBranding | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [challengeToken, setChallengeToken] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    getPublicDomainBranding(domain).then((data) => {
      setBranding(data);
      setChecked(true);
    });
  }, [domain]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(false);
    setSubmitting(true);
    const resp = await loginMailAccount({ email, password });
    setSubmitting(false);
    if (resp instanceof Error) {
      setError(true);
      return;
    }
    if (resp.requiresTwoFactor) {
      setChallengeToken(resp.challengeToken);
      return;
    }
    router.push("/dashboard/mail");
  }

  async function handleVerifyCode(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!challengeToken) return;
    setCodeError(false);
    setVerifying(true);
    const resp = await verifyMailAccountTwoFactor(challengeToken, code);
    setVerifying(false);
    if (resp instanceof Error) {
      setCodeError(true);
      return;
    }
    router.push("/dashboard/mail");
  }

  if (!checked) return null;

  const accentStyle = branding?.accentColor
    ? ({
        "--primary": branding.accentColor,
        "--primary-dark": `color-mix(in oklab, ${branding.accentColor} 85%, black)`,
        "--ring": branding.accentColor,
      } as CSSProperties)
    : undefined;

  return (
    <div className="min-h-screen bg-background" style={accentStyle}>
      <header className="border-b border-border/70">
        <div className="container flex h-16 items-center justify-end">
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
          {!branding ? (
            <div className="flex flex-col items-center py-4 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertCircle className="size-6" strokeWidth={2} />
              </span>
              <h1 className="mt-5 text-xl font-bold text-foreground">
                {t("notFoundTitle")}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t("notFoundDescription", { domain })}
              </p>
            </div>
          ) : challengeToken ? (
            <>
              <div className="flex flex-col items-center text-center">
                <h1 className="mt-2 text-xl font-bold text-foreground">
                  {t("twoFactorTitle")}
                </h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {t("twoFactorDescription")}
                </p>
              </div>

              <form onSubmit={handleVerifyCode} className="mt-7 flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="code" className="text-sm font-medium text-foreground">
                    {t("twoFactorCodeLabel")}
                  </label>
                  <Input
                    id="code"
                    name="code"
                    autoFocus
                    required
                    minLength={6}
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value);
                      setCodeError(false);
                    }}
                    placeholder={t("twoFactorCodePlaceholder")}
                  />
                </div>

                {codeError && <p className="text-sm text-destructive">{t("invalidCode")}</p>}

                <Button
                  type="submit"
                  size="lg"
                  className={cn("mt-2 w-full", premiumButton)}
                  disabled={verifying}
                >
                  {verifying ? t("verifying") : t("verify")}
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setChallengeToken(null);
                    setCode("");
                    setCodeError(false);
                  }}
                  className="text-center text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  {t("backToLogin")}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center text-center">
                <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted/40">
                  {branding.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={branding.logoUrl}
                      alt={branding.companyName || domain}
                      className="size-full object-contain"
                    />
                  ) : (
                    <Building2 className="size-6 text-muted-foreground" strokeWidth={1.5} />
                  )}
                </span>
                <h1 className="mt-4 text-xl font-bold text-foreground">
                  {t("welcomeTitle", { name: branding.companyName || domain })}
                </h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {branding.welcomeMessage || t("description")}
                </p>
              </div>

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
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError(false);
                    }}
                    placeholder={t("emailPlaceholder", { domain })}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-medium text-foreground">
                      {t("passwordLabel")}
                    </label>
                    <Link
                      href={`/mail-auth/${encodeURIComponent(domain)}/forgot-password`}
                      className="text-xs font-medium text-muted-foreground hover:text-foreground"
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

                {error && <p className="text-sm text-destructive">{t("invalidCredentials")}</p>}

                <Button
                  type="submit"
                  size="lg"
                  className={cn("mt-2 w-full", premiumButton)}
                  disabled={submitting}
                >
                  {submitting ? t("submitting") : t("submit")}
                </Button>
              </form>

              <p className="mt-6 text-center text-xs text-muted-foreground">
                {t.rich("ownerNote", {
                  link: (chunks) => (
                    <Link href="/sign-in" className="font-medium underline hover:text-foreground">
                      {chunks}
                    </Link>
                  ),
                })}
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
