"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Loader2 } from "lucide-react";
import { logout } from "@/services/auth.services";

export default function LogoutPage() {
  const t = useTranslations("Logout");
  const router = useRouter();

  useEffect(() => {
    logout().then(() => {
      router.replace("/sign-in");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background text-center">
      <Loader2 className="size-6 animate-spin text-primary" strokeWidth={1.5} />
      <p className="text-sm text-muted-foreground">{t("signingOut")}</p>
    </div>
  );
}
