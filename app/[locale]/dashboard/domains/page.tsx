"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Globe, Loader2, Plus, TriangleAlert, X } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardShell } from "@/components/dashboard/shell";
import { DomainDnsDrawer } from "@/components/dashboard/domain-dns-drawer";
import { useToast } from "@/components/dashboard/toast";
import { cn } from "@/lib/utils";
import { onboardingRegisterDomainSchema } from "@/schemas/onboarding.schemas";
import { addDomain, deleteDomain, listDomains } from "@/services/domain.services";
import { getProfile } from "@/services/auth.services";
import type { Domain, User } from "@/types";

export default function DomainsPage() {
  const t = useTranslations("Dashboard.domainsPage");
  const router = useRouter();
  const { show } = useToast();
  const [profile, setProfile] = useState<User | null>(null);
  const [checked, setChecked] = useState(false);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loadingDomains, setLoadingDomains] = useState(true);
  const [dnsDrawerDomain, setDnsDrawerDomain] = useState<string | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const [list, user] = await Promise.all([listDomains(), getProfile()]);
      if (list.length === 0) {
        router.replace("/onboarding");
        return;
      }
      setDomains(list);
      setLoadingDomains(false);
      setProfile(user);
      setChecked(true);
    })();
  }, [router]);

  if (!checked || domains.length === 0) return null;

  const primaryDomain = domains[0];
  const ownerName = profile ? `${profile.firstName} ${profile.lastName}`.trim() : "";

  async function handleAddDomain(e: React.FormEvent) {
    e.preventDefault();
    setAddError(null);

    const parsed = onboardingRegisterDomainSchema.safeParse({ name: newDomain.trim() });
    if (!parsed.success) {
      setAddError(t("addDomainError"));
      return;
    }

    setAdding(true);
    const created = await addDomain(parsed.data);
    setAdding(false);

    if (!created) {
      setAddError(t("addDomainError"));
      return;
    }

    setDomains((prev) => [created, ...prev]);
    setNewDomain("");
    setShowAddForm(false);
    show(t("addDomainSuccess", { domain: created.name }), "success");
  }

  async function handleRemove(domain: Domain) {
    if (!window.confirm(t("removeConfirm", { domain: domain.name }))) return;

    setDeletingId(domain.id);
    const ok = await deleteDomain(domain.id);
    setDeletingId(null);

    if (!ok) {
      show(t("removeError"), "error");
      return;
    }
    setDomains((prev) => prev.filter((d) => d.id !== domain.id));
    show(t("removeSuccess", { domain: domain.name }), "success");
  }

  return (
    <DashboardShell domain={primaryDomain.name} ownerName={ownerName}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {t("title")}
          </h1>
          <p className="mt-1.5 text-base text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button onClick={() => setShowAddForm((prev) => !prev)}>
          <Plus className="size-4" strokeWidth={1.5} />
          {t("addDomain")}
        </Button>
      </div>

      {showAddForm && (
        <form
          onSubmit={handleAddDomain}
          className="mt-6 flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-start"
        >
          <div className="flex-1">
            <Input
              autoFocus
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder={t("addDomainPlaceholder")}
            />
            {addError && <p className="mt-1.5 text-sm text-destructive">{addError}</p>}
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={adding}>
              {adding ? <Loader2 className="size-4 animate-spin" strokeWidth={1.5} /> : t("addDomainSubmit")}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
              <X className="size-4" strokeWidth={1.5} />
            </Button>
          </div>
        </form>
      )}

      {loadingDomains ? (
        <div className="mt-10 flex items-center justify-center rounded-2xl border border-border bg-card py-16">
          <Loader2 className="size-5 animate-spin text-muted-foreground" strokeWidth={1.5} />
        </div>
      ) : domains.length === 0 ? (
        <div className="mt-10 flex flex-col items-center rounded-2xl border border-border bg-card py-16 text-center">
          <Globe className="size-8 text-muted-foreground" strokeWidth={1.5} />
          <p className="mt-3 text-sm text-muted-foreground">{t("empty")}</p>
        </div>
      ) : (
        <div className="mt-10 flex flex-col gap-4">
          {domains.map((domain) => (
            <div
              key={domain.id}
              className="rounded-2xl border border-border bg-card p-6 shadow-[0_20px_48px_-28px_rgba(0,0,0,0.15)] sm:p-8"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Globe className="size-5" strokeWidth={1.5} />
                  </span>
                  <div>
                    <p className="text-lg font-semibold text-foreground">{domain.name}</p>
                  </div>
                </div>

                {domain.verified ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                    <Check className="size-3.5" strokeWidth={2} />
                    {t("verified")}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-700">
                    <TriangleAlert className="size-3.5" strokeWidth={1.5} />
                    {t("pending")}
                  </span>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-border/70 pt-6">
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => setDnsDrawerDomain(domain.name)}>
                    {t("viewDns")}
                  </Button>
                  <Button size="sm" variant="outline" disabled title={t("setDefaultSoon")}>
                    {t("setDefault")}
                  </Button>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={deletingId === domain.id}
                  onClick={() => handleRemove(domain)}
                  className="text-destructive hover:bg-destructive/5 hover:text-destructive"
                >
                  {deletingId === domain.id ? (
                    <Loader2 className="size-4 animate-spin" strokeWidth={1.5} />
                  ) : (
                    t("remove")
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!primaryDomain.verified && (
        <div className={cn("mt-6 flex items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3")}>
          <p className="text-sm text-amber-700">{t("finishSetupHint")}</p>
          <Button size="sm" asChild>
            <Link href="/onboarding">{t("finishSetup")}</Link>
          </Button>
        </div>
      )}

      {dnsDrawerDomain && (
        <DomainDnsDrawer domain={dnsDrawerDomain} onClose={() => setDnsDrawerDomain(null)} />
      )}
    </DashboardShell>
  );
}
