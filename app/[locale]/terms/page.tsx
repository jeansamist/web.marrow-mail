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
  const t = await getTranslations({ locale, namespace: "Metadata.terms" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `${SITE_URL}/${locale}/terms`,
      languages: localeAlternates("/terms"),
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: `${SITE_URL}/${locale}/terms`,
    },
  };
}

export default function TermsPage() {
  return <LegalContent namespace="terms" />;
}
