import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LegalContent } from "@/components/marketing/legal-content";
import { SITE_URL, localeAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata.privacy" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `${SITE_URL}/${locale}/privacy`,
      languages: localeAlternates("/privacy"),
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: `${SITE_URL}/${locale}/privacy`,
    },
  };
}

export default function PrivacyPage() {
  return <LegalContent namespace="privacy" />;
}
