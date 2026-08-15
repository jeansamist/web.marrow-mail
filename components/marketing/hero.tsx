import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  ArrowRight,
  Check,
  HardDrive,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloatingAvatar } from "@/components/marketing/floating-avatar";
import { LogoMarquee } from "@/components/marketing/logo-marquee";

const roleAddresses = ["support@", "sales@", "billing@"];

function initials(name: string) {
  return name
    .replace(/[·@].*$/, "")
    .trim()
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

// Real customer logos.
const logos = [
  { src: "/logos/lequana-robinson.png", alt: "Lequana Robinson Insurance Agency", width: 480, height: 175 },
  { src: "/logos/earthcraft.svg", alt: "Earthcraft Engraving", width: 766, height: 128 },
  { src: "/logos/ljp.svg", alt: "LJP — La joie partagée", width: 425, height: 166 },
  { src: "/logos/peerlearn.png", alt: "Peerlearn", width: 480, height: 97 },
  { src: "/logos/open-talent.svg", alt: "Open Talent", width: 716, height: 125 },
];

export function Hero() {
  const t = useTranslations("Hero");
  const modules = t.raw("modules") as string[];

  return (
    <section className="bg-background">
      <div className="container pt-14 pb-20 sm:pt-20 sm:pb-28 lg:pt-24 lg:pb-32">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-10">
          {/* Left: copy */}
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground">
              <Sparkles className="size-3.5 text-primary" />
              {t("badge")}
            </span>

            <h1 className="mt-6 text-balance text-3xl font-extrabold leading-[1.15] tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] xl:text-5xl">
              {t("headline")}
            </h1>

            <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted-foreground">
              {t("subhead")}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button asChild size="lg" className="group">
                <Link href="/signup">
                  {t("cta")}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
              <div className="text-sm leading-tight text-muted-foreground">
                <p className="font-medium text-foreground">
                  {t("ctaMicroTitle")}
                </p>
                <p>{t("ctaMicroSubtitle")}</p>
              </div>
            </div>

            <div className="mt-10">
              <p className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
                {t("modulesLabel")}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {modules.map((m, i) => (
                  <span
                    key={m}
                    className={
                      i === 0
                        ? "inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/5 px-3 py-1.5 text-sm font-medium text-primary"
                        : "inline-flex items-center rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground"
                    }
                  >
                    {i === 0 && <Check className="size-3.5" strokeWidth={3} />}
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: product mockup — a single email preview card, not a full app shell */}
          <div className="relative min-w-0 pt-12 pr-6 pb-16 pl-6 sm:pt-16 sm:pr-10 sm:pb-20 sm:pl-10">
            {/* Blurred color-blob backdrop for depth */}
            <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
              <div className="absolute -top-10 -right-6 size-56 rounded-full bg-primary/30 blur-3xl sm:size-72" />
              <div className="absolute bottom-0 left-0 size-48 rounded-full bg-primary/20 blur-3xl sm:size-64" />
              <div className="absolute top-1/3 left-1/4 size-40 rounded-full bg-accent-foreground/10 blur-3xl" />
            </div>

            <div className="relative rounded-2xl border border-border bg-card p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_30px_60px_-24px_rgba(0,0,0,0.3)] sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                    {initials(t("mockup.senderName"))}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {t("mockup.senderName")}
                    </p>
                    <p className="truncate text-sm text-primary">
                      {t("mockup.senderEmail")}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 font-mono text-xs text-muted-foreground">
                  {t("mockup.time")}
                </span>
              </div>

              <div className="mt-4 border-t border-border pt-4">
                <p className="text-base font-semibold text-foreground">
                  {t("mockup.subject")}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t("mockup.bodyPreview")}
                </p>
              </div>

              <div className="mt-4">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground">
                  <Star className="size-3.5 fill-current" />
                  {t("mockup.aiTranslateBadge")}
                </span>
              </div>
            </div>

            {/* Floating storage badge */}
            <div className="absolute top-0 right-0 flex items-center gap-2 rounded-xl border border-border bg-card px-3.5 py-2.5 shadow-[0_16px_32px_-14px_rgba(0,0,0,0.3)]">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-600">
                <HardDrive className="size-3.5" />
              </span>
              <div>
                <p className="text-[10px] text-muted-foreground">
                  {t("mockup.storageLabel")}
                </p>
                <p className="text-xs font-semibold text-foreground">
                  {t("mockup.storageValue")}
                </p>
              </div>
            </div>

            {/* Floating role-addresses card */}
            <div className="absolute bottom-0 left-0 w-56 rounded-xl bg-primary p-3.5 text-primary-foreground shadow-[0_20px_40px_-16px_rgba(0,0,0,0.35)]">
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-primary-foreground/80">
                <Users className="size-3.5" />
                {t("mockup.roleAddressesLabel")}
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {roleAddresses.map((addr) => (
                  <span
                    key={addr}
                    className="rounded-md bg-primary-foreground/15 px-2 py-1 text-xs font-medium"
                  >
                    {addr}
                  </span>
                ))}
              </div>
            </div>

            {/* Floating presence avatars */}
            <div className="absolute -top-3 -left-3 hidden size-12 rotate-6 sm:block">
              <FloatingAvatar
                src="/avatars/sarah-miller.jpg"
                alt="Sarah Miller"
                size={48}
                priority
              />
              <span className="absolute right-0 bottom-0 z-10 size-3 rounded-full border-2 border-background bg-emerald-500" />
            </div>
            <div className="absolute -right-4 bottom-16 size-14 -rotate-6">
              <FloatingAvatar
                src="/avatars/mark-davis.jpg"
                alt="Mark Davis"
                size={56}
                delay={0.3}
                priority
              />
              <span className="absolute right-0.5 bottom-0.5 z-10 size-3.5 rounded-full border-2 border-background bg-emerald-500" />
            </div>
          </div>
        </div>

        {/* Trusted by — logo strip of customer businesses */}
        <div className="mt-16 flex flex-col items-center gap-4 sm:mt-20 sm:flex-row sm:gap-8">
          <p className="shrink-0 font-mono text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
            {t("trustedLabel")}
          </p>
          <LogoMarquee logos={logos} />
        </div>
      </div>
    </section>
  );
}
