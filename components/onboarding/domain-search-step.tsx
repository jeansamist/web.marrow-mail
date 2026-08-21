"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatUsd } from "@/lib/onboarding";
import { searchDomains, type DomainSearchResult } from "@/services/domain-purchase.services";
import { premiumButton, softShadow } from "@/components/onboarding/styles";

type DomainResult = DomainSearchResult;

export function DomainSearchStep({
  onContinue,
}: {
  onContinue: (domain: string, priceUsd: number) => void;
}) {
  const t = useTranslations("Onboarding.domainSearch");
  const locale = useLocale();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"idle" | "searching">("idle");
  const [results, setResults] = useState<DomainResult[] | null>(null);
  const [selected, setSelected] = useState<DomainResult | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim() || status === "searching") return;

    const slug =
      query
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "")
        .slice(0, 40) || "yourbusiness";

    setStatus("searching");
    setResults(null);
    setSelected(null);

    const resp = await searchDomains(slug);
    setResults(resp instanceof Error ? [] : resp);
    setStatus("idle");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {t("title")}
      </h1>
      <p className="mt-2 text-muted-foreground">{t("description")}</p>

      <form onSubmit={handleSearch} className="mt-8 flex gap-2">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.5}
          />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("placeholder")}
            className="rounded-xl pl-10"
            disabled={status === "searching"}
          />
        </div>
        <Button
          type="submit"
          variant="outline"
          className="w-28 shrink-0 rounded-xl"
          disabled={status === "searching"}
        >
          {status === "searching" ? (
            <Loader2 className="size-4 animate-spin" strokeWidth={1.5} />
          ) : (
            t("search")
          )}
        </Button>
      </form>

      {status === "searching" && (
        <div className="mt-6 flex flex-col gap-2.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-4 rounded-xl border border-border p-4"
            >
              <div className="flex items-center gap-3">
                <span className="shimmer size-5 shrink-0 rounded-full" />
                <span className="shimmer h-4 w-36 rounded" />
              </div>
              <span className="shimmer h-4 w-16 shrink-0 rounded" />
            </div>
          ))}
        </div>
      )}

      {status === "idle" && results && (
        <div className="mt-6 flex flex-col gap-2.5">
          {results.map((option) => {
            const isSelected = selected?.domain === option.domain;
            return (
              <button
                key={option.domain}
                type="button"
                disabled={!option.available}
                onClick={() => option.available && setSelected(option)}
                style={isSelected ? { borderColor: "var(--primary)" } : undefined}
                className={cn(
                  "flex items-center justify-between gap-4 rounded-xl border p-4 text-left transition-all duration-300 ease-out",
                  !option.available
                    ? "cursor-not-allowed border-border bg-muted/30 opacity-60"
                    : isSelected
                      ? cn("bg-accent/40 ring-2 ring-primary/15", softShadow)
                      : "border-border bg-card hover:-translate-y-1 hover:border-primary/30 hover:shadow-md",
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full",
                      isSelected ? "bg-primary text-primary-foreground" : "border border-border",
                    )}
                  >
                    {isSelected && <Check className="size-3" strokeWidth={2} />}
                  </span>
                  <span
                    className={cn(
                      "font-medium",
                      option.available ? "text-foreground" : "text-muted-foreground line-through",
                    )}
                  >
                    {option.domain}
                  </span>
                </div>
                {option.available ? (
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-[10px] font-semibold text-secondary">
                      {t("available")}
                    </span>
                    <span className="font-mono text-sm text-muted-foreground">
                      {t("perYear", { price: formatUsd(option.priceUsd, locale) })}
                    </span>
                  </span>
                ) : (
                  <span className="shrink-0 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive">
                    {t("taken")}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <Button
        size="lg"
        className={cn("mt-8 w-full", premiumButton)}
        disabled={!selected}
        onClick={() => selected && onContinue(selected.domain, selected.priceUsd)}
      >
        {t("continue")}
      </Button>
    </div>
  );
}
