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
  const [error, setError] = useState<string | null>(null);
  const [exactDomain, setExactDomain] = useState<string | null>(null);

  // Splits "ephraim-baha.com" into base="ephraim-baha" (search slug) and a
  // remembered exact domain to prioritize in the results, instead of
  // treating the whole string as one slug and stripping the "." and TLD
  // into the base name (which used to turn "ephraim-baha.com" into a
  // meaningless "ephraimbahacom" search).
  function parseQuery(raw: string): { slug: string; exactDomain: string | null } {
    const lower = raw.toLowerCase().trim();
    const lastDot = lower.lastIndexOf(".");
    const hasTypedTld = lastDot > 0 && /^[a-z]{2,}$/.test(lower.slice(lastDot + 1));
    const base = hasTypedTld ? lower.slice(0, lastDot) : lower;
    // Hyphens are valid in domain labels — only strip characters that
    // genuinely can't appear in one, and trim stray leading/trailing hyphens.
    const slug = base.replace(/[^a-z0-9-]+/g, "").replace(/^-+|-+$/g, "").slice(0, 63);
    return {
      slug: slug || "yourbusiness",
      exactDomain: hasTypedTld && slug ? `${slug}.${lower.slice(lastDot + 1)}` : null,
    };
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim() || status === "searching") return;

    const { slug, exactDomain: parsedExactDomain } = parseQuery(query);

    setStatus("searching");
    setResults(null);
    setSelected(null);
    setError(null);
    setExactDomain(parsedExactDomain);

    const resp = await searchDomains(slug);
    if (resp instanceof Error) {
      setError(t("searchError"));
      setResults([]);
    } else {
      const sorted = parsedExactDomain
        ? [...resp].sort((a, b) =>
            a.domain === parsedExactDomain ? -1 : b.domain === parsedExactDomain ? 1 : 0,
          )
        : resp;
      setResults(sorted);
      if (sorted.length === 0) setError(t("noResultsError"));
      const exactMatch = sorted.find((r) => r.domain === parsedExactDomain && r.available);
      if (exactMatch) setSelected(exactMatch);
    }
    setStatus("idle");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {t("title")}
      </h1>
      <p className="mt-2 text-muted-foreground">{t("description")}</p>

      <form onSubmit={handleSearch} className="mt-8 flex flex-col md:flex-row gap-2">
        <div className="relative w-full md:w-auto md:flex-1">
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
          className="w-full md:w-28 shrink-0 rounded-xl"
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

      {status === "idle" && error && (
        <p className="mt-6 text-sm text-destructive">{error}</p>
      )}

      {status === "idle" && results && results.length > 0 && (
        <div className="mt-6 flex flex-col gap-2.5">
          {results.map((option) => {
            const isSelected = selected?.domain === option.domain;
            const isExactMatch = option.domain === exactDomain;
            return (
              <button
                key={option.domain}
                type="button"
                disabled={!option.available}
                onClick={() => option.available && setSelected(option)}
                style={isSelected || isExactMatch ? { borderColor: "var(--primary)" } : undefined}
                className={cn(
                  "flex items-center justify-between gap-4 rounded-xl border p-4 text-left transition-all duration-300 ease-out",
                  !option.available
                    ? "cursor-not-allowed border-border bg-muted/30 opacity-60"
                    : isSelected
                      ? cn("bg-accent/40 ring-2 ring-primary/15", softShadow)
                      : isExactMatch
                        ? cn("bg-accent/20 ring-1 ring-primary/20", softShadow)
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
                  {isExactMatch && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                      {t("yourSearch")}
                    </span>
                  )}
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
