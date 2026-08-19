"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/marketing/language-switcher";
import { cn } from "@/lib/utils";
import { cardShadow, premiumButton } from "@/components/onboarding/styles";
import { verifyForwardingEmail } from "@/services/mail.services";

export default function VerifyForwardingPage() {
  return (
    <Suspense fallback={null}>
      <VerifyForwardingPageInner />
    </Suspense>
  );
}

function VerifyForwardingPageInner() {
  const t = useTranslations("VerifyForwarding");
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<"pending" | "success" | "error">(
    token ? "pending" : "error",
  );

  useEffect(() => {
    if (!token) return;
    verifyForwardingEmail(token).then((ok) => setStatus(ok ? "success" : "error"));
  }, [token]);

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
          {status === "pending" ? (
            <div className="flex flex-col items-center py-4 text-center">
              <Loader2 className="size-8 animate-spin text-muted-foreground" strokeWidth={1.5} />
              <p className="mt-4 text-sm text-muted-foreground">{t("verifying")}</p>
            </div>
          ) : status === "success" ? (
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
            <div className="flex flex-col items-center py-4 text-center">
              <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertCircle className="size-6" strokeWidth={2} />
              </span>
              <h1 className="mt-5 text-xl font-bold text-foreground">{t("errorTitle")}</h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t("errorDescription")}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
