import { useTranslations } from "next-intl";
import Image from "next/image";
import { Check } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/marketing/reveal";

export function Reliability() {
  const t = useTranslations("Reliability");
  const points = t.raw("points") as { lead: string; description: string }[];

  return (
    <section id="reliability" className="bg-background py-20 sm:py-28 lg:py-32">
      <div className="container">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: photo + floating card */}
          <Reveal>
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div
                aria-hidden
                className="absolute -inset-6 -z-10 rounded-[2rem] bg-primary/10 blur-3xl"
              />
              <div className="overflow-hidden rounded-3xl border border-border shadow-[0_30px_60px_-24px_rgba(0,0,0,0.3)]">
                <Image
                  src="/reliability-photo.jpg"
                  alt="A business owner smiling while replying to a customer email"
                  width={900}
                  height={1350}
                  sizes="(min-width: 1024px) 50vw, (min-width: 640px) 448px, 100vw"
                  className="h-auto w-full object-cover"
                />
              </div>

              {/* Floating reply card */}
              <div className="absolute right-4 bottom-4 w-56 rounded-xl border border-border bg-card p-4 shadow-[0_20px_40px_-16px_rgba(0,0,0,0.35)] sm:right-6 sm:bottom-6 sm:w-64">
                <div className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  <p className="text-[11px] font-semibold text-foreground">
                    {t("card.title")}
                  </p>
                </div>
                <p className="mt-1.5 text-sm text-foreground/80">
                  &ldquo;{t("card.quote")}&rdquo;
                </p>
              </div>
            </div>
          </Reveal>

          {/* Right: copy */}
          <Reveal delay={0.1}>
            <span className="font-mono text-xs font-medium uppercase tracking-[0.15em] text-primary">
              {t("eyebrow")}
            </span>
            <h2 className="mt-4 text-balance text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {t("title")}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              {t("description")}
            </p>

            <ul className="mt-8 flex flex-col gap-5 border-t border-border pt-8">
              {points.map((point) => (
                <li key={point.lead} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Check className="size-3 text-primary" strokeWidth={3} />
                  </span>
                  <p className="leading-relaxed">
                    <span className="font-semibold text-foreground">
                      {point.lead}.
                    </span>{" "}
                    <span className="text-muted-foreground">
                      {point.description}
                    </span>
                  </p>
                </li>
              ))}
            </ul>

            <Button size="lg" className="group mt-8" asChild>
              <Link href="/signup">
                {t("cta")}
                <span className="transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
            </Button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
