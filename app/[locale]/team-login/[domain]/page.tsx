"use client";

import { useEffect, useState, type CSSProperties, type FormEvent } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { AlertCircle, Building2 } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LanguageSwitcher } from "@/components/marketing/language-switcher";
import { findMailboxByEmail, loadAccount, type OnboardingAccount } from "@/lib/onboarding";
import { cn } from "@/lib/utils";
import { cardShadow, premiumButton } from "@/components/onboarding/styles";

export default function TeamLoginPage() {
  const t = useTranslations("TeamLogin");
  const router = useRouter();
  const params = useParams<{ domain: string }>();
  const domain = decodeURIComponent(params.domain ?? "");

  const [checked, setChecked] = useState(false);
  const [account, setAccount] = useState<OnboardingAccount | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    const stored = loadAccount();
    if (stored && stored.domain.toLowerCase() === domain.toLowerCase()) {
      setAccount(stored);
    }
    setChecked(true);
  }, [domain]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!account) return;
    const mailbox = findMailboxByEmail(account, email);
    if (mailbox) {
      router.push("/dashboard/mail");
    } else {
      setError(true);
    }
  }

  if (!checked) return null;

  const accentStyle = account?.branding.accentColor
    ? ({
        "--primary": account.branding.accentColor,
        "--primary-dark": `color-mix(in oklab, ${account.branding.accentColor} 85%, black)`,
        "--ring": account.branding.accentColor,
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
          {!account ? (
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
          ) : (
            <>
              <div className="flex flex-col items-center text-center">
                <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted/40">
                  {account.branding.logoDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={account.branding.logoDataUrl}
                      alt={account.branding.companyName || account.domain}
                      className="size-full object-contain"
                    />
                  ) : (
                    <Building2 className="size-6 text-muted-foreground" strokeWidth={1.5} />
                  )}
                </span>
                <h1 className="mt-4 text-xl font-bold text-foreground">
                  {t("welcomeTitle", { name: account.branding.companyName || account.domain })}
                </h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {account.branding.welcomeMessage || t("description")}
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
                    placeholder={t("emailPlaceholder", { domain: account.domain })}
                  />
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

                {error && <p className="text-sm text-destructive">{t("mailboxNotFound")}</p>}

                <Button type="submit" size="lg" className={cn("mt-2 w-full", premiumButton)}>
                  {t("submit")}
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
