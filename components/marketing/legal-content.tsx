import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import { LanguageSwitcher } from "@/components/marketing/language-switcher";

export async function LegalContent({ namespace }: { namespace: "terms" | "privacy" }) {
  const t = await getTranslations("Legal");
  const title = t(`${namespace}.title`);
  const intro = t(`${namespace}.intro`);
  const sections = t.raw(`${namespace}.sections`) as { heading: string; body: string }[];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/70">
        <div className="container flex h-16 items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            {t("backLabel")}
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="container max-w-3xl py-12 sm:py-16">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("lastUpdated")}</p>
        <p className="mt-6 text-base leading-relaxed text-muted-foreground">{intro}</p>

        <div className="mt-10 flex flex-col gap-8">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-lg font-semibold text-foreground">{section.heading}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {section.body}
              </p>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
