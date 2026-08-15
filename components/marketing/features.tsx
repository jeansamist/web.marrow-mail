import { useTranslations } from "next-intl";
import { ArrowRight, Bell, ShieldCheck, Sparkles, Wand2 } from "lucide-react";
import { Section } from "@/components/marketing/section";
import { Reveal } from "@/components/marketing/reveal";

const roleChips = ["support@", "sales@", "info@", "billing@", "hello@", "+5 more"];

export function Features() {
  const t = useTranslations("Features");

  return (
    <Section
      id="features"
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("description")}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12">
        {/* AI Summaries — large */}
        <Reveal className="sm:col-span-2 lg:col-span-7" delay={0}>
          <div className="flex h-full flex-col justify-between gap-8 rounded-2xl border border-border bg-card transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_20px_40px_-16px_rgba(0,0,0,0.15)] active:-translate-y-1 active:border-primary/30 active:shadow-[0_20px_40px_-16px_rgba(0,0,0,0.15)] p-6 sm:flex-row sm:items-center sm:p-8">
            <div className="sm:max-w-[45%]">
              <h3 className="text-xl font-semibold tracking-tight">
                {t("summaries.title")}
              </h3>
              <p className="mt-2 text-muted-foreground">
                {t("summaries.description")}
              </p>
            </div>
            <div className="w-full shrink-0 sm:w-64">
              <div className="space-y-1.5">
                <div className="h-2 w-full rounded-full bg-muted" />
                <div className="h-2 w-4/5 rounded-full bg-muted" />
                <div className="h-2 w-full rounded-full bg-muted" />
                <div className="h-2 w-3/5 rounded-full bg-muted" />
              </div>
              <div className="my-3 flex items-center gap-2">
                <div className="h-px flex-1 bg-border" />
                <Sparkles className="size-4 shrink-0 text-primary" />
                <div className="h-px flex-1 bg-border" />
              </div>
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                <p className="text-xs leading-relaxed text-foreground/80">
                  {t("summaries.example")}
                </p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Role-based addresses — large */}
        <Reveal className="sm:col-span-2 lg:col-span-5" delay={0.08}>
          <div className="flex h-full flex-col rounded-2xl border border-border bg-card transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_20px_40px_-16px_rgba(0,0,0,0.15)] active:-translate-y-1 active:border-primary/30 active:shadow-[0_20px_40px_-16px_rgba(0,0,0,0.15)] p-6 sm:p-8">
            <h3 className="text-xl font-semibold tracking-tight">
              {t("roles.title")}
            </h3>
            <p className="mt-2 text-muted-foreground">
              {t("roles.description")}
            </p>
            <div className="mt-auto flex flex-wrap gap-2 pt-6">
              {roleChips.map((addr) => (
                <span
                  key={addr}
                  className="rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-medium text-foreground/80"
                >
                  {addr}
                </span>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Translation */}
        <Reveal className="lg:col-span-3" delay={0.16}>
          <div className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-card transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_20px_40px_-16px_rgba(0,0,0,0.15)] active:-translate-y-1 active:border-primary/30 active:shadow-[0_20px_40px_-16px_rgba(0,0,0,0.15)] p-6">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-primary/10 px-2.5 py-1 font-mono text-xs font-semibold text-primary">
                EN
              </span>
              <ArrowRight className="size-3.5 text-muted-foreground" />
              <span className="rounded-lg bg-primary/10 px-2.5 py-1 font-mono text-xs font-semibold text-primary">
                FR
              </span>
            </div>
            <h3 className="font-semibold">{t("translation.title")}</h3>
          </div>
        </Reveal>

        {/* Follow-up reminders */}
        <Reveal className="lg:col-span-3" delay={0.24}>
          <div className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-card transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_20px_40px_-16px_rgba(0,0,0,0.15)] active:-translate-y-1 active:border-primary/30 active:shadow-[0_20px_40px_-16px_rgba(0,0,0,0.15)] p-6">
            <div className="inline-flex w-fit items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
              <Bell className="size-3.5 text-primary" />
              {t("followup.badge")}
            </div>
            <h3 className="font-semibold">{t("followup.title")}</h3>
          </div>
        </Reveal>

        {/* AI Rewrite */}
        <Reveal className="lg:col-span-3" delay={0.32}>
          <div className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-card transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_20px_40px_-16px_rgba(0,0,0,0.15)] active:-translate-y-1 active:border-primary/30 active:shadow-[0_20px_40px_-16px_rgba(0,0,0,0.15)] p-6">
            <div className="flex items-center gap-2 text-xs">
              <span className="truncate text-muted-foreground line-through decoration-muted-foreground/50">
                {t("rewrite.before")}
              </span>
              <Wand2 className="size-3.5 shrink-0 text-primary" />
            </div>
            <h3 className="font-semibold">{t("rewrite.title")}</h3>
          </div>
        </Reveal>

        {/* Private & secure */}
        <Reveal className="lg:col-span-3" delay={0.4}>
          <div className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-card transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_20px_40px_-16px_rgba(0,0,0,0.15)] active:-translate-y-1 active:border-primary/30 active:shadow-[0_20px_40px_-16px_rgba(0,0,0,0.15)] p-6">
            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
              <ShieldCheck className="size-4" />
            </div>
            <h3 className="font-semibold">{t("secure.title")}</h3>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
