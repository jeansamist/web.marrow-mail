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
  const t = await getTranslations({ locale, namespace: "SignIn" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `${SITE_URL}/${locale}/sign-in`,
      languages: localeAlternates("/sign-in"),
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: `${SITE_URL}/${locale}/sign-in`,
    },
  };
}

export default function SignInLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
