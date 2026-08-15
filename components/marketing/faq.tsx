"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { Section } from "@/components/marketing/section";
import { cn } from "@/lib/utils";

export function Faq() {
  const t = useTranslations("Faq");
  const faqs = t.raw("items") as { q: string; a: string }[];
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Section id="faq" eyebrow={t("eyebrow")} title={t("title")}>
      <div className="mx-auto max-w-2xl divide-y divide-border rounded-2xl border border-border">
        {faqs.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.q}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
              >
                <span className="font-medium text-foreground">{item.q}</span>
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 text-muted-foreground transition-transform",
                    isOpen && "rotate-180",
                  )}
                />
              </button>
              <div
                className={cn(
                  "grid overflow-hidden transition-[grid-template-rows] duration-200",
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                )}
              >
                <div className="overflow-hidden">
                  <p className="px-6 pb-4 text-sm leading-relaxed text-muted-foreground">
                    {item.a}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
