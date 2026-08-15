import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Nav } from "@/components/marketing/nav";
import { Hero } from "@/components/marketing/hero";
import { Features } from "@/components/marketing/features";
import { Compare } from "@/components/marketing/compare";
import { Testimonials } from "@/components/marketing/testimonials";
import { Reliability } from "@/components/marketing/reliability";
import { Pricing } from "@/components/marketing/pricing";
import { Faq } from "@/components/marketing/faq";
import { Cta } from "@/components/marketing/cta";
import { Footer } from "@/components/marketing/footer";
import { MobileCtaBar } from "@/components/marketing/mobile-cta-bar";
import { SITE_URL, localeAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata.home" });

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: localeAlternates("/"),
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      url: `${SITE_URL}/${locale}`,
    },
  };
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Faq" });
  const faqs = t.raw("items") as { q: string; a: string }[];

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "MarrowMail",
    url: SITE_URL,
    description:
      "Professional business email with your own domain, AI-powered tools, and Mobile Money billing.",
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Nav />
      <main>
        <Hero />
        <Features />
        <Compare />
        <Testimonials />
        <Reliability />
        <Pricing />
        <Faq />
        <Cta />
      </main>
      <Footer />
      <MobileCtaBar />
    </>
  );
}
