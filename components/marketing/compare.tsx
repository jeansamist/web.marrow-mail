import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Check, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "@/components/marketing/section";
import { Reveal } from "@/components/marketing/reveal";
import { cn } from "@/lib/utils";

type PlanKey = "google" | "marrow" | "ms";

function RowValue({
  value,
  highlight,
}: {
  value: string | boolean;
  highlight?: boolean;
}) {
  if (typeof value === "boolean") {
    return value ? (
      <Check
        className={cn(
          "size-4",
          highlight ? "text-primary" : "text-muted-foreground/50",
        )}
      />
    ) : (
      <Minus className="size-4 text-muted-foreground/40" />
    );
  }
  return (
    <span
      className={cn(
        "text-right text-sm",
        highlight ? "font-semibold text-foreground" : "text-muted-foreground",
      )}
    >
      {value}
    </span>
  );
}

export function Compare() {
  const t = useTranslations("Compare");
  const rows = t.raw("rows") as {
    label: string;
    marrow: string | boolean;
    google: string | boolean;
    ms: string | boolean;
  }[];

  const plans: { key: PlanKey; name: string; winner: boolean }[] = [
    { key: "google", name: t("headers.google"), winner: false },
    { key: "marrow", name: t("headers.marrow"), winner: true },
    { key: "ms", name: t("headers.ms"), winner: false },
  ];

  return (
    <Section
      id="compare"
      eyebrow={t("eyebrow")}
      title={t("title")}
      description={t("description")}
    >
      <div className="mx-auto grid max-w-4xl grid-cols-1 items-start gap-5 lg:grid-cols-3">
        {plans.map((plan, i) => (
          <Reveal
            key={plan.key}
            delay={i * 0.08}
            className={cn(plan.winner && "order-first lg:order-none")}
          >
            <div
              className={cn(
                "flex h-full flex-col rounded-2xl border p-6 transition-all duration-200",
                plan.winner
                  ? "border-primary/40 bg-card shadow-[0_20px_48px_-24px_rgba(0,0,0,0.25)] hover:shadow-[0_28px_56px_-20px_rgba(0,0,0,0.3)] active:shadow-[0_28px_56px_-20px_rgba(0,0,0,0.3)] lg:-my-4 lg:p-8"
                  : "border-border bg-muted/20 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_20px_40px_-16px_rgba(0,0,0,0.15)] active:-translate-y-1 active:border-primary/30 active:shadow-[0_20px_40px_-16px_rgba(0,0,0,0.15)]",
              )}
            >
              {plan.winner ? (
                <span className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  {t("pickLabel")}
                </span>
              ) : (
                <span className="mb-4 h-[26px]" aria-hidden />
              )}

              <h3
                className={cn(
                  "text-lg font-semibold",
                  plan.winner ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {plan.name}
              </h3>

              <ul className="mt-5 flex flex-1 flex-col gap-3.5">
                {rows.map((row) => (
                  <li
                    key={row.label}
                    className="flex items-center justify-between gap-3 border-b border-border/60 pb-3.5 last:border-b-0 last:pb-0"
                  >
                    <span className="text-xs text-muted-foreground">
                      {row.label}
                    </span>
                    <RowValue value={row[plan.key]} highlight={plan.winner} />
                  </li>
                ))}
              </ul>

              {plan.winner && (
                <Button className="mt-6 w-full" asChild>
                  <Link href="/signup">{t("cta")}</Link>
                </Button>
              )}
            </div>
          </Reveal>
        ))}
      </div>
      <p className="mt-6 text-center text-xs text-muted-foreground">
        {t("footnote")}
      </p>
    </Section>
  );
}
