import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "TeamLogin" });

  return {
    title: t("title"),
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function TeamLoginLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
