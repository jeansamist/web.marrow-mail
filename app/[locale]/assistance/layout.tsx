import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SITE_URL, localeAlternates } from "@/lib/seo";
import type { ReactNode } from "react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Assistance" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `${SITE_URL}/${locale}/assistance`,
      languages: localeAlternates("/assistance"),
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: `${SITE_URL}/${locale}/assistance`,
    },
  };
}

export default function AssistanceLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
