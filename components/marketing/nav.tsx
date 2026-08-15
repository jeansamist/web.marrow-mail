"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Menu, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/marketing/language-switcher";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

export function Nav() {
  const t = useTranslations("Nav");
  const [open, setOpen] = useState(false);

  const links = [
    { href: "#features", label: t("links.features") },
    { href: "#pricing", label: t("links.pricing") },
    { href: "#compare", label: t("links.compare") },
    { href: "#faq", label: t("links.faq") },
    { href: "#support", label: t("links.support") },
  ];

  return (
    <header className="sticky top-0 z-50">
      <a
        href="#pricing"
        className="flex items-center justify-center gap-1.5 bg-ink px-4 py-2 text-center text-xs font-medium text-ink-foreground hover:bg-ink/90"
      >
        {t("announcement")}
        <ArrowRight className="size-3.5" />
      </a>

      <div className="border-b border-border/70 bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/">
            <Logo className="h-9 w-auto text-foreground" />
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="relative py-1 text-sm font-medium text-muted-foreground transition-colors after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-0 after:rounded-full after:bg-primary after:transition-all after:duration-200 hover:text-primary hover:after:w-full"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <LanguageSwitcher />
            <Button variant="ghost" size="sm" asChild>
              <Link href="/sign-in">{t("signIn")}</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup">{t("cta")}</Link>
            </Button>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <LanguageSwitcher />
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="inline-flex size-11 items-center justify-center rounded-full text-foreground"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        <div
          className={cn(
            "overflow-hidden border-t border-border/70 bg-background transition-[max-height] duration-200 lg:hidden",
            open ? "max-h-96" : "max-h-0 border-t-0",
          )}
        >
          <nav className="container flex flex-col gap-1 py-4">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-2 px-2">
              <Button variant="outline" asChild>
                <Link href="/sign-in">{t("signIn")}</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">{t("cta")}</Link>
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
