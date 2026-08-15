"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AtSign, Plus, Trash2, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  DURATION_OPTIONS,
  PLANS,
  calcMailboxPricing,
  createMailbox,
  formatXaf,
  type BillingMonths,
  type Mailbox,
  type PlanId,
} from "@/lib/onboarding";
import { premiumButton, softShadow } from "@/components/onboarding/styles";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Row {
  id: string;
  username: string;
  fullName: string;
  assignedTo: string;
  assigning: boolean;
}

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

function toRow(mailbox: Mailbox): Row {
  return {
    id: mailbox.id,
    username: mailbox.username,
    fullName: mailbox.fullName ?? "",
    assignedTo: mailbox.assignedTo ?? "",
    assigning: false,
  };
}

export function MailboxSetupStep({
  domain,
  plan,
  initialMailboxes,
  initialBillingMonths,
  onContinue,
}: {
  domain: string;
  plan: PlanId;
  initialMailboxes: Mailbox[];
  initialBillingMonths: BillingMonths;
  onContinue: (mailboxes: Mailbox[], billingMonths: BillingMonths) => void;
}) {
  const t = useTranslations("Onboarding.mailboxes");
  const locale = useLocale();
  const [rows, setRows] = useState<Row[]>(
    initialMailboxes.length > 0 ? initialMailboxes.map(toRow) : [
      { id: makeId(), username: "", fullName: "", assignedTo: "", assigning: false },
    ],
  );
  const [months, setMonths] = useState<BillingMonths>(initialBillingMonths);
  const [touched, setTouched] = useState(false);

  function updateRow(id: string, patch: Partial<Row>) {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  function addRow() {
    setRows((prev) => [
      ...prev,
      { id: makeId(), username: "", fullName: "", assignedTo: "", assigning: false },
    ]);
  }

  function removeRow(id: string) {
    setRows((prev) => (prev.length > 1 ? prev.filter((row) => row.id !== id) : prev));
  }

  const isRowValid = (row: Row) => row.username.trim().length > 0;
  const allValid = rows.every(isRowValid);
  const pricing = calcMailboxPricing(rows.length, months, plan);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (!allValid) return;
    const mailboxes = rows.map((row) =>
      createMailbox(
        row.username.trim().toLowerCase(),
        row.assignedTo.trim() ? row.assignedTo.trim() : null,
        row.fullName.trim() ? row.fullName.trim() : null,
        PLANS[plan].storageGB,
      ),
    );
    onContinue(mailboxes, months);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {t("title")}
      </h1>
      <p className="mt-2 text-muted-foreground">{t("description")}</p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        {rows.map((row, i) => {
          const showError = touched && !isRowValid(row);
          return (
            <div
              key={row.id}
              className="rounded-xl border border-border bg-card p-4 transition-all duration-200 focus-within:border-primary/40"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <AtSign className="size-3" strokeWidth={1.5} />
                  </span>
                  {t("mailboxLabel", { index: i + 1 })}
                </span>
                {rows.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    aria-label="Remove mailbox"
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="size-4" strokeWidth={1.5} />
                  </button>
                )}
              </div>

              <div className="mt-3">
                <label className="text-xs font-medium text-muted-foreground">
                  {t("usernameLabel")}
                </label>
                <div className="mt-1 flex items-center overflow-hidden rounded-xl border border-border focus-within:border-primary">
                  <Input
                    value={row.username}
                    onChange={(e) => updateRow(row.id, { username: e.target.value })}
                    placeholder={t("usernamePlaceholder")}
                    className="rounded-none border-0"
                  />
                  <span className="shrink-0 pr-3.5 font-mono text-sm text-muted-foreground">
                    @{domain || "yourdomain.com"}
                  </span>
                </div>
                {showError && (
                  <p className="mt-1.5 text-xs text-destructive">{t("rowError")}</p>
                )}
              </div>

              <div className="mt-3">
                {row.assignedTo && !row.assigning ? (
                  <div className="flex items-center justify-between gap-2 rounded-lg bg-secondary/10 px-3 py-2">
                    <span className="truncate text-xs font-medium text-secondary">
                      {row.fullName
                        ? t("assignedToNamed", { name: row.fullName, email: row.assignedTo })
                        : t("assignedTo", { email: row.assignedTo })}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateRow(row.id, { assignedTo: "", fullName: "" })}
                      className="shrink-0 text-secondary/60 hover:text-secondary"
                      aria-label={t("removeAssign")}
                    >
                      <X className="size-3.5" strokeWidth={1.5} />
                    </button>
                  </div>
                ) : row.assigning ? (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      autoFocus
                      value={row.fullName}
                      onChange={(e) => updateRow(row.id, { fullName: e.target.value })}
                      placeholder={t("fullNamePlaceholder")}
                      className="h-9 text-sm"
                    />
                    <Input
                      type="email"
                      value={row.assignedTo}
                      onChange={(e) => updateRow(row.id, { assignedTo: e.target.value })}
                      onBlur={() => {
                        if (!row.assignedTo.trim() || !EMAIL_PATTERN.test(row.assignedTo.trim())) {
                          updateRow(row.id, { assigning: false, assignedTo: "", fullName: "" });
                        } else {
                          updateRow(row.id, { assigning: false });
                        }
                      }}
                      placeholder={t("assignPlaceholder")}
                      className="h-9 text-sm"
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => updateRow(row.id, { assigning: true })}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80"
                  >
                    <UserPlus className="size-3.5" strokeWidth={1.5} />
                    {t("assignLabel")}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground"
        >
          <Plus className="size-4" strokeWidth={1.5} />
          {t("addAnother")}
        </button>

        <div className={cn("mt-2 rounded-xl border border-border bg-card p-5", softShadow)}>
          <p className="text-sm font-medium text-foreground">{t("billingDurationLabel")}</p>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {DURATION_OPTIONS.map((m) => {
              const optionPricing = calcMailboxPricing(rows.length, m, plan);
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMonths(m)}
                  style={months === m ? { borderColor: "var(--primary)" } : undefined}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl border p-2.5 transition-all duration-300 ease-out",
                    months === m
                      ? "bg-accent/40 ring-2 ring-primary/15"
                      : "border-border hover:-translate-y-1 hover:border-primary/30 hover:shadow-md",
                  )}
                >
                  <span className="text-sm font-semibold text-foreground">
                    {t("durationLabel", { months: m })}
                  </span>
                  {optionPricing.totalDiscountPercent > 0 ? (
                    <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                      {t("save", { percent: optionPricing.totalDiscountPercent })}
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground">
                      {t("noDiscount")}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-5 flex items-end justify-between border-t border-border pt-4">
            <div>
              <p className="text-xs text-muted-foreground">
                {t("summaryLine", { count: rows.length, months })}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {t("perMonth", { price: formatXaf(pricing.perMailboxPerMonth, locale) })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">{t("totalLabel")}</p>
              <p className="font-mono text-xl font-semibold text-foreground">
                {formatXaf(pricing.total, locale)}
              </p>
            </div>
          </div>
        </div>

        <Button type="submit" size="lg" className={cn("mt-2 w-full", premiumButton)}>
          {t("continue")}
        </Button>
      </form>
    </div>
  );
}
