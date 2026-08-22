"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AtSign, Plus, Trash2 } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardShell } from "@/components/dashboard/shell";
import { useToast } from "@/components/dashboard/toast";
import { MailboxCard } from "@/components/dashboard/mailbox-card";
import { MailboxDrawer } from "@/components/dashboard/mailbox-drawer";
import { premiumButton } from "@/components/onboarding/styles";
import { cn } from "@/lib/utils";
import { PLANS } from "@/lib/onboarding";
import { listDomains } from "@/services/domain.services";
import {
  listMailAccounts,
  deleteMailAccountApi,
  toggleMailAccountActive,
  resendMailAccountInvite,
} from "@/services/mail-account.services";
import { getStorageUsage } from "@/services/storage.services";
import { getCurrentSubscription } from "@/services/subscription.services";
import { getProfile } from "@/services/auth.services";
import { forgotMailAccountPassword } from "@/services/mail.services";
import {
  listRoleAliases,
  createRoleAlias,
  deleteRoleAlias,
} from "@/services/role-alias.services";
import type { Domain, MailAccount, MailboxStorageUsage, RoleAlias, Subscription } from "@/types";

export default function MailboxesPage() {
  const t = useTranslations("Dashboard.mailboxesPage");
  const router = useRouter();
  const { show } = useToast();

  const [checked, setChecked] = useState(false);
  const [domain, setDomain] = useState<Domain | null>(null);
  const [ownerName, setOwnerName] = useState("");
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [mailAccounts, setMailAccounts] = useState<MailAccount[]>([]);
  const [usageByAccount, setUsageByAccount] = useState<Record<number, MailboxStorageUsage>>({});
  const [roleAliases, setRoleAliases] = useState<RoleAlias[]>([]);
  const [openMailboxId, setOpenMailboxId] = useState<number | null>(null);
  const [creatingRole, setCreatingRole] = useState(false);
  const [alias, setAlias] = useState("");
  const [forwardsToId, setForwardsToId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const [domains, accounts, storage, currentSubscription, profile] = await Promise.all([
        listDomains(),
        listMailAccounts(),
        getStorageUsage(),
        getCurrentSubscription(),
        getProfile(),
      ]);
      if (domains.length === 0) {
        router.replace("/onboarding");
        return;
      }
      const primaryDomain = domains[0];
      setDomain(primaryDomain);
      setOwnerName(profile ? `${profile.firstName} ${profile.lastName}`.trim() : "");
      setSubscription(currentSubscription);
      setMailAccounts(accounts);
      setForwardsToId((current) => current ?? accounts[0]?.id ?? null);
      setUsageByAccount(
        Object.fromEntries((storage?.mailboxes ?? []).map((m) => [m.mailAccountId, m])),
      );

      const aliases = await listRoleAliases(primaryDomain.id);
      setRoleAliases(aliases);
      setChecked(true);
    })();
  }, [router]);

  if (!checked || !domain) return null;

  const openMailbox = mailAccounts.find((a) => a.id === openMailboxId) ?? null;
  const openMailboxUsage = openMailbox ? usageByAccount[openMailbox.id] : undefined;
  const roleAliasLimit = PLANS[subscription?.planId ?? "core"].roleAliasLimit;
  const atRoleLimit = roleAliases.length >= roleAliasLimit;
  const aliasValid = /^[a-z0-9-]+$/i.test(alias.trim());

  async function deleteMailbox(id: number) {
    const ok = await deleteMailAccountApi(id);
    if (!ok) {
      show(t("drawer.deleteError"), "error");
      return;
    }
    setMailAccounts((current) => current.filter((a) => a.id !== id));
    setOpenMailboxId(null);
    show(t("drawer.mailboxDeleted"), "info");
  }

  async function toggleActive(id: number) {
    const updated = await toggleMailAccountActive(id);
    if (!updated) {
      show(t("drawer.toggleError"), "error");
      return;
    }
    setMailAccounts((current) => current.map((a) => (a.id === id ? updated : a)));
  }

  async function refreshStorageUsage() {
    const storage = await getStorageUsage();
    setUsageByAccount(
      Object.fromEntries((storage?.mailboxes ?? []).map((m) => [m.mailAccountId, m])),
    );
  }

  async function resendInvite(id: number) {
    const ok = await resendMailAccountInvite(id);
    if (!ok) show(t("drawer.inviteError"), "error");
  }

  async function resetPassword(mailAccount: MailAccount) {
    const email = `${mailAccount.username}@${domain!.name}`;
    const resp = await forgotMailAccountPassword({ email });
    if (resp instanceof Error) show(t("drawer.passwordResetError"), "error");
  }

  async function handleCreateRole(e: React.FormEvent) {
    e.preventDefault();
    if (!domain || !aliasValid || !forwardsToId || atRoleLimit) return;
    const created = await createRoleAlias(domain.id, {
      alias: alias.trim().toLowerCase(),
      mailAccountId: forwardsToId,
    });
    if (created instanceof Error) {
      show(created.message || t("roles.createError"), "error");
      return;
    }
    setRoleAliases((current) => [created, ...current]);
    show(t("roles.created", { alias: `${created.alias}@${domain.name}` }), "success");
    setAlias("");
    setCreatingRole(false);
  }

  async function removeRole(id: number) {
    const ok = await deleteRoleAlias(id);
    if (!ok) {
      show(t("roles.deleteError"), "error");
      return;
    }
    setRoleAliases((current) => current.filter((r) => r.id !== id));
    show(t("roles.deleted"), "info");
  }

  return (
    <DashboardShell domain={domain.name} ownerName={ownerName}>
      <div className="space-y-8">
        <div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {t("title")}
            </h1>
            <Button className={cn(premiumButton)} asChild>
              <Link href="/dashboard/mailboxes/add">
                <Plus className="size-4" strokeWidth={1.5} />
                {t("addMailbox")}
              </Link>
            </Button>
          </div>
          <p className="mt-1.5 text-base text-muted-foreground">{t("subtitle")}</p>
        </div>

        {/* Individual mailboxes */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground/75">
            {t("individualTitle")}
          </h2>

          {mailAccounts.length === 0 ? (
            <div className="mt-3 rounded-2xl border border-dashed border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">{t("emptyIndividual")}</p>
            </div>
          ) : (
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {mailAccounts.map((mailAccount) => (
                <MailboxCard
                  key={mailAccount.id}
                  mailAccount={mailAccount}
                  domain={domain.name}
                  usedBytes={usageByAccount[mailAccount.id]?.usedBytes ?? 0}
                  quotaBytes={usageByAccount[mailAccount.id]?.quotaBytes ?? 0}
                  onClick={() => setOpenMailboxId(mailAccount.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Role-based mailboxes */}
        <div id="roles" className="scroll-mt-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground/75">
            {t("roleTitle")}
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {t("roles.description", {
              used: roleAliases.length,
              limit: roleAliasLimit,
            })}
          </p>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {roleAliases.map((role) => {
              const target = mailAccounts.find((a) => a.id === role.mailAccountId);
              return (
                <div
                  key={role.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <AtSign className="size-4" strokeWidth={1.5} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {role.alias}@{domain.name}
                      </p>
                      <p className="mt-0.5 truncate text-sm font-medium text-foreground/70">
                        {t("roles.forwardsTo", {
                          email: target ? `${target.username}@${domain.name}` : "—",
                        })}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeRole(role.id)}
                    aria-label={t("roles.remove")}
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" strokeWidth={1.5} />
                  </button>
                </div>
              );
            })}

            {!creatingRole ? (
              <button
                type="button"
                disabled={atRoleLimit}
                onClick={() => setCreatingRole(true)}
                className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_16px_32px_-20px_rgba(0,0,0,0.18)] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:border-border disabled:hover:shadow-none"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary/20">
                  <Plus className="size-4" strokeWidth={1.5} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {atRoleLimit ? t("roles.limitReached") : t("roles.create")}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {t("roles.createDescription")}
                  </p>
                </div>
              </button>
            ) : (
              <form
                onSubmit={handleCreateRole}
                className="flex flex-col gap-2.5 rounded-2xl border border-primary/30 bg-accent/20 p-4"
              >
                <div className="flex items-center overflow-hidden rounded-lg border border-border bg-background focus-within:border-primary">
                  <Input
                    autoFocus
                    value={alias}
                    onChange={(e) => setAlias(e.target.value)}
                    placeholder="support"
                    className="h-9 rounded-none border-0 text-sm"
                  />
                  <span className="shrink-0 pr-3 font-mono text-xs text-muted-foreground">
                    @{domain.name}
                  </span>
                </div>
                <select
                  value={forwardsToId ?? ""}
                  onChange={(e) => setForwardsToId(Number(e.target.value))}
                  className="h-9 w-full rounded-lg border border-border bg-background px-2.5 text-sm text-foreground outline-none focus-visible:border-primary"
                >
                  {mailAccounts.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.username}@{domain.name}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    size="sm"
                    className="flex-1"
                    disabled={!aliasValid || !forwardsToId}
                  >
                    {t("roles.create")}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setCreatingRole(false)}
                  >
                    {t("roles.cancel")}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {openMailbox && (
        <MailboxDrawer
          mailAccount={openMailbox}
          domain={domain.name}
          usedBytes={openMailboxUsage?.usedBytes ?? 0}
          quotaBytes={openMailboxUsage?.quotaBytes ?? 0}
          onClose={() => setOpenMailboxId(null)}
          onDelete={() => deleteMailbox(openMailbox.id)}
          onToggleActive={() => toggleActive(openMailbox.id)}
          onStorageAdded={refreshStorageUsage}
          onResendInvite={() => resendInvite(openMailbox.id)}
          onResetPassword={() => resetPassword(openMailbox)}
        />
      )}
    </DashboardShell>
  );
}
