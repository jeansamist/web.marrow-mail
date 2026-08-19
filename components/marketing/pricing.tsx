import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  AtSign,
  Bell,
  HardDrive,
  Languages,
  LifeBuoy,
  Mic,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/marketing/section";
import { Reveal } from "@/components/marketing/reveal";
import { cn } from "@/lib/utils";
import {
  MtnMoneyLogo,
  OrangeMoneyLogo,
  VisaLogo,
} from "@/components/marketing/payment-logos";

const includedIcons = [AtSign, Sparkles, Languages, Bell, ShieldCheck, Send, LifeBuoy];

const paymentLogos = [
  { name: "Orange Money", Logo: OrangeMoneyLogo, className: "h-8 w-auto" },
  { name: "MTN MoMo", Logo: MtnMoneyLogo, className: "h-8 w-auto" },
  { name: "Visa", Logo: VisaLogo, className: "h-8 w-auto" },
];

const PLAN_IDS = ["core", "plus"] as const;

export function Pricing() {
  const t = useTranslations("Pricing");
  const included = t.raw("included") as string[];

  return (
    <Section
      id="pricing"
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("description")}
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
        {PLAN_IDS.map((planId) => {
          const isPlus = planId === "plus";
          return (
            <Reveal key={planId} className="relative">
              {isPlus && (
                <div
                  aria-hidden
                  className="absolute -inset-6 -z-10 rounded-[3rem] bg-primary/10 blur-3xl"
                />
              )}
              <div
                className={cn(
                  "relative overflow-hidden rounded-3xl border bg-card shadow-[0_30px_60px_-24px_rgba(0,0,0,0.25)] transition-shadow duration-200 hover:shadow-[0_36px_72px_-20px_rgba(0,0,0,0.3)]",
                  isPlus ? "border-primary/30" : "border-border",
                )}
              >
                {isPlus && (
                  <span className="absolute top-6 right-6 rounded-full bg-[#FBB02D] px-3 py-1 text-[11px] font-semibold text-slate-900">
                    {t("popularBadge")}
                  </span>
                )}
                <div className="border-b border-border bg-accent px-8 py-6 text-center">
                  <span className="font-mono text-xs font-semibold uppercase tracking-[0.15em] text-primary">
                    {t(`${planId}.name`)}
                  </span>
                  <div className="mt-3 flex items-end justify-center gap-1">
                    <span className="font-mono text-xl lg:text-5xl font-semibold tracking-tight text-foreground">
                      {t(`${planId}.price`)}
                    </span>
                    <span className="mb-1 text-lg text-muted-foreground">
                      {t("priceSuffix")}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-4">
                    {paymentLogos.map(({ name, Logo, className }) => (
                      <span key={name} title={name} className="inline-flex">
                        <Logo className={className} />
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-8">
                  <ul className="flex flex-col gap-3">
                    <li className="flex items-start gap-2.5 text-sm">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <HardDrive className="size-3.5" />
                      </span>
                      <span className="pt-0.5 font-medium text-foreground">
                        {t(`${planId}.storage`)}
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5 text-sm">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        <Users className="size-3.5" />
                      </span>
                      <span className="pt-0.5 font-medium text-foreground">
                        {t(`${planId}.roleAliases`)}
                      </span>
                    </li>
                    {isPlus && (
                      <li className="flex items-start gap-2.5 text-sm">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-secondary/10 text-secondary">
                          <Mic className="size-3.5" />
                        </span>
                        <span className="pt-0.5 font-medium text-secondary">
                          {t("plus.voiceNotes")}
                        </span>
                      </li>
                    )}
                    {included.map((item, i) => {
                      const Icon = includedIcons[i];
                      return (
                        <li key={item} className="flex items-start gap-2.5 text-sm">
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                            <Icon className="size-3.5" />
                          </span>
                          <span className="pt-0.5 text-foreground/85">{item}</span>
                        </li>
                      );
                    })}
                  </ul>

                  <Button size="lg" className="mt-8 w-full" asChild>
                    <Link href={{ pathname: "/signup", query: { plan: planId } }}>
                      {t("cta")}
                    </Link>
                  </Button>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
      <p className="mt-6 text-center font-mono text-xs text-muted-foreground">
        {t("microcopy")}
      </p>
    </Section>
  );
}
