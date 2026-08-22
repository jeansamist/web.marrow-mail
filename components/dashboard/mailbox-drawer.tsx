"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Ban,
  Copy,
  HardDrive,
  KeyRound,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/dashboard/toast";
import { SITE_URL } from "@/lib/seo";
import {
  getStorageTier,
  storageTierBarClass,
  STORAGE_PRICE_PER_GB_XAF,
} from "@/lib/onboarding";
import { PaymentStep } from "@/components/onboarding/payment-step";
import type { MailAccount } from "@/types";

const BYTES_PER_GB = 1024 ** 3;
const STORAGE_ADD_OPTIONS_GB = [5, 10, 20];

function initials(value: string) {
  return value
    .split(/[.\s_-]+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function MailboxDrawer({
  mailAccount,
  domain,
  usedBytes,
  quotaBytes,
  onClose,
  onToggleActive,
  onDelete,
  onResendInvite,
  onResetPassword,
  onStorageAdded,
}: {
  mailAccount: MailAccount;
  domain: string;
  usedBytes: number;
  quotaBytes: number;
  onClose: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
  onResendInvite: () => void;
  onResetPassword: () => void;
  onStorageAdded: () => void;
}) {
  const t = useTranslations("Dashboard.mailboxesPage");
  const locale = useLocale();
  const { show } = useToast();
  const [addingGB, setAddingGB] = useState<number | null>(null);
  const usedGB = usedBytes / BYTES_PER_GB;
  const quotaGB = quotaBytes / BYTES_PER_GB;
  const usageFraction = quotaBytes > 0 ? Math.min(usedBytes / quotaBytes, 1) : 0;
  const email = `${mailAccount.username}@${domain}`;
  const loginUrl = `${SITE_URL}/${locale}/team-login/${domain}`;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        aria-hidden
        onClick={onClose}
        className="absolute inset-0 bg-black/30"
      />
      <motion.div
        initial={{ x: 32, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="relative flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-border bg-card p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {initials(mailAccount.username)}
            </span>
            <div>
              <h2 className="text-lg font-bold text-foreground">{mailAccount.username}</h2>
              <p className="font-mono text-sm text-primary">{email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("drawer.close")}
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" strokeWidth={1.5} />
          </button>
        </div>

        <dl className="mt-6 flex flex-col gap-4 border-t border-border pt-5">
          <div className="flex items-center justify-between text-sm">
            <dt className="text-muted-foreground">{t("drawer.status")}</dt>
            <dd
              className={cn(
                "rounded-full px-2 py-0.5 text-xs font-semibold",
                mailAccount.active
                  ? "bg-emerald-500/10 text-emerald-700"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {mailAccount.active ? t("status.active") : t("status.disabled")}
            </dd>
          </div>
          <div className="flex items-center justify-between text-sm">
            <dt className="text-muted-foreground">{t("drawer.assignedTo")}</dt>
            <dd className="font-medium text-foreground">
              {mailAccount.ownerEmail ?? t("drawer.unassigned")}
            </dd>
          </div>
        </dl>

        <div className="mt-5 border-t border-border pt-5">
          <div className="flex items-center justify-between text-sm">
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <HardDrive className="size-3.5" strokeWidth={1.5} />
              {t("drawer.storage")}
            </span>
            <span className="font-medium tabular-nums text-foreground">
              {t("storageUsage", { used: usedGB.toFixed(1), total: quotaGB.toFixed(0) })}
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full rounded-full", storageTierBarClass(getStorageTier(usageFraction)))}
              style={{ width: `${usageFraction * 100}%` }}
            />
          </div>
          {addingGB === null ? (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {STORAGE_ADD_OPTIONS_GB.map((gb) => (
                <button
                  key={gb}
                  type="button"
                  onClick={() => setAddingGB(gb)}
                  className="flex flex-col items-center gap-0.5 rounded-lg border border-border py-2 text-xs transition-colors hover:border-primary/40 hover:bg-muted/40"
                >
                  <span className="font-semibold text-foreground">+{gb} GB</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setAddingGB(null)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-3.5" strokeWidth={1.5} />
                {t("drawer.storageAddCancel")}
              </button>
              <div className="mt-3">
                <PaymentStep
                  variant="storage"
                  mailAccountId={mailAccount.id}
                  extraGB={addingGB}
                  lineItems={[
                    {
                      label: t("drawer.storageAddLineItem", { gb: addingGB }),
                      amount: addingGB * STORAGE_PRICE_PER_GB_XAF,
                    },
                  ]}
                  onPaid={() => {
                    show(t("drawer.storageAdded", { gb: addingGB }), "success");
                    setAddingGB(null);
                    onStorageAdded();
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-col gap-2 border-t border-border pt-5">
          <Button
            variant="outline"
            className="justify-start gap-2.5"
            onClick={() => {
              onResetPassword();
              show(t("drawer.passwordResetSent", { email }), "success");
            }}
          >
            <KeyRound className="size-4" strokeWidth={1.5} />
            {t("actions.resetPassword")}
          </Button>
          <Button
            variant="outline"
            className="justify-start gap-2.5"
            onClick={() => {
              navigator.clipboard?.writeText(loginUrl);
              show(t("drawer.loginLinkCopied"), "success");
            }}
          >
            <Copy className="size-4" strokeWidth={1.5} />
            {t("actions.copyLoginLink")}
          </Button>
          {mailAccount.ownerEmail && (
            <Button
              variant="outline"
              className="justify-start gap-2.5"
              onClick={() => {
                onResendInvite();
                show(t("drawer.invitationResent", { email: mailAccount.ownerEmail }), "success");
              }}
            >
              <Send className="size-4" strokeWidth={1.5} />
              {t("actions.resendInvitation")}
            </Button>
          )}
          <Button
            variant="outline"
            className="justify-start gap-2.5"
            onClick={() => {
              onToggleActive();
              show(
                mailAccount.active ? t("drawer.mailboxDisabled") : t("drawer.mailboxEnabled"),
                "info",
              );
            }}
          >
            <Ban className="size-4" strokeWidth={1.5} />
            {mailAccount.active ? t("actions.disableMailbox") : t("actions.enableMailbox")}
          </Button>
          <Button
            variant="outline"
            className="justify-start gap-2.5 border-destructive/30 text-destructive hover:bg-destructive/5"
            onClick={() => {
              if (window.confirm(t("drawer.deleteConfirm", { email }))) {
                onDelete();
              }
            }}
          >
            <Trash2 className="size-4" strokeWidth={1.5} />
            {t("actions.deleteMailbox")}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
