"use client";

import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import {
  Ban,
  Copy,
  HardDrive,
  KeyRound,
  Link2,
  Mail,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/dashboard/toast";
import { SITE_URL } from "@/lib/seo";
import {
  STORAGE_PRICE_PER_GB_XAF,
  formatXaf,
  getMailboxLastLogin,
  getMailboxStorageUsedGB,
  getStorageTier,
  storageTierBarClass,
  type Mailbox,
} from "@/lib/onboarding";

const STORAGE_ADD_OPTIONS = [5, 10, 20];

export function MailboxDrawer({
  mailbox,
  domain,
  onClose,
  onToggleStatus,
  onDelete,
  onBuyStorage,
  disableUnavailableActions = false,
}: {
  mailbox: Mailbox;
  domain: string;
  onClose: () => void;
  onToggleStatus?: () => void;
  onDelete: () => void;
  onBuyStorage?: (extraGB: number) => void;
  disableUnavailableActions?: boolean;
}) {
  const t = useTranslations("Dashboard.mailboxesPage");
  const locale = useLocale();
  const { show } = useToast();
  const usedGB = getMailboxStorageUsedGB(mailbox);
  const usageFraction = Math.min(usedGB / mailbox.storagePurchasedGB, 1);
  const lastLogin = getMailboxLastLogin(mailbox);
  const dateFormatter = new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const email = `${mailbox.username}@${domain}`;

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
          <div>
            <h2 className="text-lg font-bold text-foreground">
              {mailbox.fullName || mailbox.username}
            </h2>
            <p className="font-mono text-sm text-primary">{email}</p>
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
                mailbox.status === "active"
                  ? "bg-emerald-500/10 text-emerald-700"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {mailbox.status === "active" ? t("status.active") : t("status.disabled")}
            </dd>
          </div>
          <div className="flex items-center justify-between text-sm">
            <dt className="text-muted-foreground">{t("drawer.invitation")}</dt>
            <dd className="font-medium text-foreground">
              {mailbox.invitationStatus === "pending"
                ? t("status.invitationPending")
                : mailbox.invitationStatus === "accepted"
                  ? t("status.accepted")
                  : t("status.notApplicable")}
            </dd>
          </div>
          <div className="flex items-center justify-between text-sm">
            <dt className="text-muted-foreground">{t("drawer.assignedTo")}</dt>
            <dd className="font-medium text-foreground">
              {mailbox.assignedTo ?? t("drawer.unassigned")}
            </dd>
          </div>
          <div className="flex items-center justify-between text-sm">
            <dt className="text-muted-foreground">{t("drawer.lastLogin")}</dt>
            <dd className="font-medium text-foreground">
              {lastLogin ? dateFormatter.format(new Date(lastLogin)) : t("drawer.never")}
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
              {t("storageUsage", { used: usedGB, total: mailbox.storagePurchasedGB })}
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full rounded-full", storageTierBarClass(getStorageTier(usageFraction)))}
              style={{ width: `${usageFraction * 100}%` }}
            />
          </div>
          <div
            className={cn(
              "mt-3 grid grid-cols-3 gap-2",
              disableUnavailableActions && "opacity-50",
            )}
            title={disableUnavailableActions ? t("drawer.unavailableSoon") : undefined}
          >
            {STORAGE_ADD_OPTIONS.map((gb) => (
              <button
                key={gb}
                type="button"
                disabled={disableUnavailableActions}
                onClick={() => {
                  onBuyStorage?.(gb);
                  show(t("drawer.storageAdded", { gb }), "success");
                }}
                className="flex flex-col items-center gap-0.5 rounded-lg border border-border py-2 text-xs transition-colors hover:border-primary/40 hover:bg-muted/40 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:bg-transparent"
              >
                <span className="font-semibold text-foreground">+{gb} GB</span>
                <span className="text-muted-foreground">
                  {formatXaf(gb * STORAGE_PRICE_PER_GB_XAF, locale)}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2 border-t border-border pt-5">
          <Button
            variant="outline"
            className="justify-start gap-2.5"
            onClick={() => show(t("drawer.passwordResetSent", { email }), "success")}
          >
            <KeyRound className="size-4" strokeWidth={1.5} />
            {t("actions.resetPassword")}
          </Button>
          <Button
            variant="outline"
            className="justify-start gap-2.5"
            onClick={() => {
              navigator.clipboard?.writeText(`mail.${domain}`);
              show(t("drawer.loginLinkCopied"), "success");
            }}
          >
            <Copy className="size-4" strokeWidth={1.5} />
            {t("actions.copyLoginLink")}
          </Button>
          {mailbox.invitationStatus === "pending" && (
            <>
              <Button
                variant="outline"
                className="justify-start gap-2.5"
                onClick={() => {
                  const params = new URLSearchParams({
                    domain,
                    email: mailbox.assignedTo ?? "",
                  });
                  navigator.clipboard?.writeText(
                    `${SITE_URL}/${locale}/accept-invite?${params.toString()}`,
                  );
                  show(t("drawer.inviteLinkCopied"), "success");
                }}
              >
                <Link2 className="size-4" strokeWidth={1.5} />
                {t("actions.copyInviteLink")}
              </Button>
              <Button
                variant="outline"
                className="justify-start gap-2.5"
                onClick={() =>
                  show(t("drawer.invitationResent", { email: mailbox.assignedTo }), "success")
                }
              >
                <Send className="size-4" strokeWidth={1.5} />
                {t("actions.resendInvitation")}
              </Button>
            </>
          )}
          <Button
            variant="outline"
            className="justify-start gap-2.5"
            disabled={disableUnavailableActions}
            title={disableUnavailableActions ? t("drawer.unavailableSoon") : undefined}
            onClick={() => {
              onToggleStatus?.();
              show(
                mailbox.status === "active"
                  ? t("drawer.mailboxDisabled")
                  : t("drawer.mailboxEnabled"),
                "info",
              );
            }}
          >
            <Ban className="size-4" strokeWidth={1.5} />
            {mailbox.status === "active"
              ? t("actions.disableMailbox")
              : t("actions.enableMailbox")}
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

        <p className="mt-5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Mail className="size-3.5" strokeWidth={1.5} />
          {t("drawer.storagePolicy", { amount: mailbox.storagePurchasedGB })}
        </p>
      </motion.div>
    </div>
  );
}
