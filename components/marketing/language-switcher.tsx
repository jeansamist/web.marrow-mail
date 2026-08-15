"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Globe, Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const localeNames: Record<string, string> = {
  en: "English",
  fr: "Français",
};

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function switchTo(nextLocale: string) {
    setOpen(false);
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Change language"
        className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
      >
        <Globe className="size-4 text-muted-foreground" />
        {locale.toUpperCase()}
        <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-40 overflow-hidden rounded-xl border border-border bg-card py-1 shadow-[0_20px_40px_-16px_rgba(0,0,0,0.25)]">
          {Object.entries(localeNames).map(([code, label]) => (
            <button
              key={code}
              type="button"
              onClick={() => switchTo(code)}
              className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm text-foreground hover:bg-muted"
            >
              {label}
              {locale === code && <Check className="size-3.5 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
