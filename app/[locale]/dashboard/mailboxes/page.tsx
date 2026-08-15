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
import {
  createRoleAlias,
  getRoleAliasLimit,
  loadAccount,
  saveAccount,
  PLANS,
  type Mailbox,
  type OnboardingAccount,
} from "@/lib/onboarding";
import { listMailAccounts, deleteMailAccountApi } from "@/services/mail-account.services";
import type { MailAccount } from "@/types";

function toMailbox(account: MailAccount, storageGB: number): Mailbox {
  return {
    id: String(account.id),
    username: account.username,
    fullName: null,
    assignedTo: account.ownerEmail,
    invitationStatus: "none",
    status: "active",
    storagePurchasedGB: storageGB,
    createdAt: account.createdAt,
  };
}

export default function MailboxesPage() {
  const t = useTranslations("Dashboard.mailboxesPage");
  const router = useRouter();
  const { show } = useToast();
  const [account, setAccount] = useState<OnboardingAccount | null>(null);
  const [checked, setChecked] = useState(false);
  const [mailAccounts, setMailAccounts] = useState<MailAccount[]>([]);
  const [openMailboxId, setOpenMailboxId] = useState<string | null>(null);
  const [creatingRole, setCreatingRole] = useState(false);
  const [alias, setAlias] = useState("");
  const [forwardsTo, setForwardsTo] = useState("");

  useEffect(() => {
    const stored = loadAccount();
    if (!stored) {
      router.replace("/onboarding");
      return;
    }
    setAccount(stored);
    setChecked(true);
  }, [router]);

  useEffect(() => {
    listMailAccounts().then((accounts) => {
      setMailAccounts(accounts);
      setForwardsTo((current) => current || accounts[0]?.username || "");
    });
  }, []);

  if (!checked || !account) return null;

  const mailboxes = mailAccounts.map((a) => toMailbox(a, PLANS[account.plan].storageGB));
  const openMailbox = mailboxes.find((m) => m.id === openMailboxId) ?? null;

  function persist(next: OnboardingAccount) {
    saveAccount(next);
    setAccount(next);
  }

  async function deleteMailbox(id: string) {
    const ok = await deleteMailAccountApi(Number(id));
    if (!ok) {
      show(t("drawer.deleteError"), "error");
      return;
    }
    setMailAccounts((current) => current.filter((a) => String(a.id) !== id));
    setOpenMailboxId(null);
    show(t("drawer.mailboxDeleted"), "info");
  }

  function handleCreateRole(e: React.FormEvent) {
    e.preventDefault();
    if (!account) return;
    const aliasValid = /^[a-z0-9-]+$/i.test(alias.trim());
    if (!aliasValid || !forwardsTo || account.roleAliases.length >= getRoleAliasLimit(account))
      return;
    persist({
      ...account,
      roleAliases: [
        ...account.roleAliases,
        createRoleAlias(alias.trim().toLowerCase(), forwardsTo),
      ],
    });
    show(t("roles.created", { alias: `${alias.trim().toLowerCase()}@${account.domain}` }), "success");
    setAlias("");
    setCreatingRole(false);
  }

  function removeRole(id: string) {
    if (!account) return;
    persist({ ...account, roleAliases: account.roleAliases.filter((r) => r.id !== id) });
    show(t("roles.deleted"), "info");
  }

  const aliasValid = /^[a-z0-9-]+$/i.test(alias.trim());
  const roleAliasLimit = getRoleAliasLimit(account);
  const atRoleLimit = account.roleAliases.length >= roleAliasLimit;

  return (
    <DashboardShell domain={account.domain} ownerName={account.ownerName}>
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

          {mailboxes.length === 0 ? (
            <div className="mt-3 rounded-2xl border border-dashed border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">{t("emptyIndividual")}</p>
            </div>
          ) : (
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {mailboxes.map((mailbox) => (
                <MailboxCard
                  key={mailbox.id}
                  mailbox={mailbox}
                  domain={account.domain}
                  onClick={() => setOpenMailboxId(mailbox.id)}
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
              used: account.roleAliases.length,
              limit: roleAliasLimit,
            })}
          </p>

          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {account.roleAliases.map((role) => (
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
                      {role.alias}@{account.domain}
                    </p>
                    <p className="mt-0.5 truncate text-sm font-medium text-foreground/70">
                      {t("roles.forwardsTo", { email: `${role.forwardsTo}@${account.domain}` })}
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
            ))}

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
                    @{account.domain}
                  </span>
                </div>
                <select
                  value={forwardsTo}
                  onChange={(e) => setForwardsTo(e.target.value)}
                  className="h-9 w-full rounded-lg border border-border bg-background px-2.5 text-sm text-foreground outline-none focus-visible:border-primary"
                >
                  {mailAccounts.map((m) => (
                    <option key={m.id} value={m.username}>
                      {m.username}@{account.domain}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    size="sm"
                    className="flex-1"
                    disabled={!aliasValid || !forwardsTo}
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
          mailbox={openMailbox}
          domain={account.domain}
          disableUnavailableActions
          onClose={() => setOpenMailboxId(null)}
          onDelete={() => deleteMailbox(openMailbox.id)}
        />
      )}
    </DashboardShell>
  );
}
