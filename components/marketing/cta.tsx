import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export function Cta() {
  const t = useTranslations("Cta");

  return (
    <section className="bg-ink py-20 sm:py-28 lg:py-32">
      <div className="container flex flex-col items-center gap-6 text-center">
        <h2 className="text-balance text-3xl font-semibold leading-tight tracking-tight text-ink-foreground sm:text-4xl lg:text-5xl">
          {t("title")}
        </h2>
        <p className="max-w-xl text-balance text-lg text-ink-foreground/70">
          {t("description")}
        </p>

        <p className="mt-2 text-sm text-ink-foreground/60">
          {t("reassurance")}
        </p>

        <Button size="lg" asChild className="h-14 px-10 text-base">
          <Link href="/signup">{t("cta")}</Link>
        </Button>

        <p className="font-mono text-xs text-ink-foreground/50">
          {t("microcopy")}
        </p>
      </div>
    </section>
  );
}
