import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; domain: string }>;
}): Promise<Metadata> {
  const { locale, domain } = await params;
  const t = await getTranslations({ locale, namespace: "AcceptInvite" });

  return {
    title: t("title", { domain }),
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function SetupMailAccountProfileLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
