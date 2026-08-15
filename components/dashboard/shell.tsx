"use client";

import { type ReactNode, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  ChevronRight,
  CreditCard,
  Globe,
  Home,
  Mail,
  Menu,
  PackageOpen,
  PanelLeftClose,
  PanelLeftOpen,
  Send,
  Settings,
  Sparkles,
  X,
} from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { Logo, LogoMark } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

const SIDEBAR_COLLAPSE_KEY = "marrowmail.sidebar.collapsed";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "A";
  return parts
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function useNavItems() {
  const t = useTranslations("Dashboard.nav");
  return [
    { href: "/dashboard", label: t("overview"), icon: Home },
    { href: "/dashboard/mailboxes", label: t("mailboxes"), icon: Mail },
    { href: "/dashboard/domains", label: t("domains"), icon: Globe },
    { href: "/dashboard/storage", label: t("storage"), icon: PackageOpen },
    { href: "/dashboard/ai-credits", label: t("aiCredits"), icon: Sparkles },
    { href: "/dashboard/subscription", label: t("subscription"), icon: CreditCard },
    { href: "/dashboard/settings", label: t("settings"), icon: Settings },
  ];
}

function Sidebar({
  collapsed,
  onToggle,
  ownerName,
}: {
  collapsed: boolean;
  onToggle: () => void;
  ownerName: string;
}) {
  const pathname = usePathname();
  const items = useNavItems();
  const t = useTranslations("Dashboard.nav");
  const tRoot = useTranslations("Dashboard");
  const displayName = ownerName || tRoot("adminLabel");

  return (
    <aside
      className={cn(
        "hidden shrink-0 bg-sidebar transition-all duration-200 lg:flex lg:flex-col",
        collapsed ? "w-[68px]" : "w-64",
      )}
    >
      <div
        className={cn(
          "flex h-20 items-center px-5",
          collapsed ? "flex-col justify-center gap-2" : "justify-between",
        )}
      >
        {collapsed ? (
          <Link href="/">
            <LogoMark className="size-7" />
          </Link>
        ) : (
          <Link href="/">
            <Logo className="h-7 w-auto text-sidebar-foreground" />
          </Link>
        )}
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? t("expand") : t("collapse")}
          className="flex size-7 shrink-0 items-center justify-center rounded-lg text-sidebar-foreground/50 transition-colors hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground"
        >
          {collapsed ? (
            <PanelLeftOpen className="size-4" strokeWidth={1.5} />
          ) : (
            <PanelLeftClose className="size-4" strokeWidth={1.5} />
          )}
        </button>
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-3.5 px-4">
        {items.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200",
                collapsed && "justify-center",
                active
                  ? "bg-[#FBB02D] text-slate-900"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-foreground/5 hover:text-sidebar-foreground",
              )}
            >
              <item.icon className="size-5 shrink-0" strokeWidth={1.5} />
              {!collapsed && item.label}
            </Link>
          );
        })}

        <Link
          href="/dashboard/mail"
          title={collapsed ? t("openMailbox") : undefined}
          className={cn(
            "mt-4 flex items-center gap-3 rounded-xl bg-primary px-3.5 py-3 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25",
            collapsed && "justify-center",
          )}
        >
          <Send className="size-5 shrink-0" strokeWidth={1.5} />
          {!collapsed && t("openMailbox")}
        </Link>
      </nav>

      <div
        className={cn(
          "mx-4 mb-6 flex items-center gap-3 rounded-xl px-2 py-2",
          collapsed && "justify-center px-0",
        )}
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-xs font-semibold text-primary-foreground">
          {getInitials(displayName)}
        </span>
        {!collapsed && (
          <span className="truncate text-sm font-medium text-sidebar-foreground/90">
            {displayName}
          </span>
        )}
      </div>
    </aside>
  );
}

function MobileNavDrawer({
  open,
  onClose,
  ownerName,
}: {
  open: boolean;
  onClose: () => void;
  ownerName: string;
}) {
  const pathname = usePathname();
  const items = useNavItems();
  const t = useTranslations("Dashboard.nav");
  const tRoot = useTranslations("Dashboard");
  const displayName = ownerName || tRoot("adminLabel");

  return (
    <div className="lg:hidden">
      {open && (
        <div
          aria-hidden
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/30"
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-20 items-center justify-between px-5">
          <Link href="/">
            <Logo className="h-7 w-auto text-sidebar-foreground" />
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("collapse")}
            className="flex size-7 shrink-0 items-center justify-center rounded-lg text-sidebar-foreground/50 transition-colors hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground"
          >
            <X className="size-4" strokeWidth={1.5} />
          </button>
        </div>

        <nav className="mt-4 flex flex-1 flex-col gap-3.5 overflow-y-auto px-4">
          {items.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-[#FBB02D] text-slate-900"
                    : "text-sidebar-foreground/60 hover:bg-sidebar-foreground/5 hover:text-sidebar-foreground",
                )}
              >
                <item.icon className="size-5 shrink-0" strokeWidth={1.5} />
                {item.label}
              </Link>
            );
          })}

          <Link
            href="/dashboard/mail"
            onClick={onClose}
            className="mt-4 flex items-center gap-3 rounded-xl bg-primary px-3.5 py-3 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25"
          >
            <Send className="size-5 shrink-0" strokeWidth={1.5} />
            {t("openMailbox")}
          </Link>
        </nav>

        <div className="mx-4 mb-6 flex items-center gap-3 rounded-xl px-2 py-2">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-xs font-semibold text-primary-foreground">
            {getInitials(displayName)}
          </span>
          <span className="truncate text-sm font-medium text-sidebar-foreground/90">
            {displayName}
          </span>
        </div>
      </aside>
    </div>
  );
}

function Breadcrumbs({ domain }: { domain: string }) {
  const pathname = usePathname();
  const t = useTranslations("Dashboard.nav");
  const labels: Record<string, string> = {
    dashboard: t("overview"),
    mailboxes: t("mailboxes"),
    domains: t("domains"),
    storage: t("storage"),
    "ai-credits": t("aiCredits"),
    subscription: t("subscription"),
    settings: t("settings"),
    mail: t("openMailbox"),
    add: t("addMailbox"),
  };
  const segments = pathname.split("/").filter(Boolean);

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80">
      <span className="font-medium">{domain}</span>
      {segments.map((seg, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight className="size-3" strokeWidth={1.5} />
          <span className={i === segments.length - 1 ? "text-foreground/70" : undefined}>
            {labels[seg] ?? seg}
          </span>
        </span>
      ))}
    </div>
  );
}

function Topbar({ domain, onOpenNav }: { domain: string; onOpenNav: () => void }) {
  const t = useTranslations("Dashboard.nav");
  return (
    <header className="flex h-12 items-center gap-3 bg-background px-4 sm:px-8">
      <button
        type="button"
        onClick={onOpenNav}
        aria-label={t("expand")}
        className="flex size-8 shrink-0 items-center justify-center rounded-lg text-foreground/70 transition-colors hover:bg-muted lg:hidden"
      >
        <Menu className="size-5" strokeWidth={1.5} />
      </button>
      <Breadcrumbs domain={domain} />
    </header>
  );
}

export function DashboardShell({
  domain,
  ownerName = "",
  fullWidth = false,
  children,
}: {
  domain: string;
  ownerName?: string;
  fullWidth?: boolean;
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setCollapsed(window.localStorage.getItem(SIDEBAR_COLLAPSE_KEY) === "1");
  }, []);

  function toggle() {
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(SIDEBAR_COLLAPSE_KEY, next ? "1" : "0");
      return next;
    });
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar collapsed={collapsed} onToggle={toggle} ownerName={ownerName} />
      <MobileNavDrawer
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        ownerName={ownerName}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar domain={domain} onOpenNav={() => setMobileNavOpen(true)} />
        <main className="flex-1 px-6 pt-2 pb-6 sm:px-10 sm:pt-3 sm:pb-10 lg:px-12 lg:pt-4 lg:pb-12">
          {fullWidth ? children : <div className="mx-auto max-w-6xl">{children}</div>}
        </main>
      </div>
    </div>
  );
}
