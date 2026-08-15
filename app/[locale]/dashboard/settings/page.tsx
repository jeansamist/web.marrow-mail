"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { Check, Copy, Download, Image as ImageIcon, TriangleAlert, Upload, X } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardShell } from "@/components/dashboard/shell";
import { LanguageSwitcher } from "@/components/marketing/language-switcher";
import { TeamLoginLinkCard, useLoginLinkCopy } from "@/components/dashboard/team-login-link";
import { useToast } from "@/components/dashboard/toast";
import { clearAccount, loadAccount, saveAccount, type OnboardingAccount } from "@/lib/onboarding";
import { premiumButton, softShadow } from "@/components/onboarding/styles";
import { cn } from "@/lib/utils";

const DEFAULT_ACCENT_COLOR = "#FB6107";

export default function SettingsPage() {
  const t = useTranslations("Dashboard.settingsPage");
  const tLink = useTranslations("Dashboard.loginLink");
  const router = useRouter();
  const { show } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [account, setAccount] = useState<OnboardingAccount | null>(null);
  const [checked, setChecked] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [accentColor, setAccentColor] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const { loginUrl, copied, handleCopy } = useLoginLinkCopy(account?.domain ?? "");

  useEffect(() => {
    const stored = loadAccount();
    if (!stored) {
      router.replace("/onboarding");
      return;
    }
    setAccount(stored);
    setCompanyName(stored.branding.companyName);
    setWelcomeMessage(stored.branding.welcomeMessage);
    setLogoDataUrl(stored.branding.logoDataUrl);
    setAccentColor(stored.branding.accentColor);
    setChecked(true);
  }, [router]);

  if (!checked || !account) return null;

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogoDataUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleSave() {
    if (!account) return;
    const next: OnboardingAccount = {
      ...account,
      branding: { companyName, welcomeMessage, logoDataUrl, accentColor },
    };
    saveAccount(next);
    setAccount(next);
    show(t("branding.saved"), "success");
  }

  function handleExportData() {
    if (!account) return;
    const blob = new Blob([JSON.stringify(account, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `marrowmail-${account.domain}-export.json`;
    a.click();
    URL.revokeObjectURL(url);
    show(t("dataSection.exported"), "success");
  }

  function handleDeleteAccount() {
    clearAccount();
    router.push("/");
  }

  return (
    <DashboardShell domain={account.domain} ownerName={account.ownerName}>
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        {t("title")}
      </h1>
      <p className="mt-1.5 max-w-2xl text-base text-muted-foreground">
        {t("subtitle")}
      </p>

      <dl className="mt-8 max-w-md divide-y divide-border/70">
        <div className="flex items-center justify-between py-3.5">
          <dt className="text-sm text-muted-foreground">{t("domainLabel")}</dt>
          <dd className="text-sm font-semibold text-foreground">{account.domain}</dd>
        </div>
        <div className="flex items-center justify-between py-3.5">
          <dt className="text-sm text-muted-foreground">{t("languageLabel")}</dt>
          <dd>
            <LanguageSwitcher />
          </dd>
        </div>
      </dl>

      <div className="mt-10">
        <TeamLoginLinkCard
          domain={account.domain}
          title={tLink("title")}
          description={tLink("description", {
            name: account.branding.companyName || account.domain,
          })}
          copyLabel={tLink("copy")}
          copiedLabel={tLink("copied")}
        />
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
          <h2 className="text-base font-semibold text-foreground">
            {t("branding.title")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("branding.description")}
          </p>

          <div className="mt-4">
            <label className="text-xs font-medium text-muted-foreground">
              {t("branding.logoLabel")}
            </label>
            <div className="mt-1.5 flex items-center gap-3">
              <span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted/40">
                {logoDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoDataUrl}
                    alt={t("branding.logoAlt")}
                    className="size-full object-contain"
                  />
                ) : (
                  <ImageIcon className="size-5 text-muted-foreground" strokeWidth={1.5} />
                )}
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="size-3.5" strokeWidth={1.5} />
                {t("branding.upload")}
              </Button>
              {logoDataUrl && (
                <button
                  type="button"
                  onClick={() => setLogoDataUrl(null)}
                  aria-label={t("branding.removeLogo")}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="size-4" strokeWidth={1.5} />
                </button>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label className="text-xs font-medium text-muted-foreground">
              {t("branding.companyNameLabel")}
            </label>
            <Input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder={t("branding.companyNamePlaceholder")}
              className="mt-1.5"
            />
          </div>

          <div className="mt-4">
            <label className="text-xs font-medium text-muted-foreground">
              {t("branding.welcomeMessageLabel")}
            </label>
            <Input
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div className="mt-4 flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5">
            <span className="text-sm text-muted-foreground">
              {t("branding.accentColorLabel")}
            </span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={accentColor ?? DEFAULT_ACCENT_COLOR}
                onChange={(e) => setAccentColor(e.target.value)}
                aria-label={t("branding.accentColorLabel")}
                className="size-7 shrink-0 cursor-pointer rounded-md border border-border bg-transparent p-0.5"
              />
              {accentColor && (
                <button
                  type="button"
                  onClick={() => setAccentColor(null)}
                  aria-label={t("branding.resetAccentColor")}
                  className="text-xs font-medium text-muted-foreground hover:text-destructive"
                >
                  {t("branding.resetAccentColor")}
                </button>
              )}
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5">
            <div className="min-w-0">
              <span className="text-sm text-muted-foreground">{t("branding.customUrlLabel")}</span>
              <p className="truncate font-mono text-xs text-foreground/80">{loginUrl}</p>
            </div>
            <Button type="button" size="sm" variant="outline" onClick={handleCopy}>
              {copied ? (
                <Check className="size-3.5" strokeWidth={1.5} />
              ) : (
                <Copy className="size-3.5" strokeWidth={1.5} />
              )}
              {copied ? tLink("copied") : tLink("copy")}
            </Button>
          </div>

          <Button className={cn("mt-5 w-full", premiumButton)} onClick={handleSave}>
            {t("branding.save")}
          </Button>
        </div>

        <div className="h-fit rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
            {t("branding.previewTitle")}
          </p>
          <div
            className="mt-3 rounded-xl border border-border bg-background p-6 text-center"
            style={
              accentColor
                ? ({
                    "--primary": accentColor,
                    "--primary-dark": `color-mix(in oklab, ${accentColor} 85%, black)`,
                    "--ring": accentColor,
                  } as CSSProperties)
                : undefined
            }
          >
            <span className="mx-auto flex size-12 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/40">
              {logoDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoDataUrl}
                  alt={t("branding.logoAlt")}
                  className="size-full object-contain"
                />
              ) : (
                <ImageIcon className="size-5 text-muted-foreground" strokeWidth={1.5} />
              )}
            </span>
            <p className="mt-3 text-sm font-semibold text-foreground">
              {t("branding.previewWelcome", { name: companyName || account.domain })}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {welcomeMessage || t("branding.welcomeMessageLabel")}
            </p>
            <div className="mt-4 flex flex-col gap-2 text-left">
              <span className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                {t("branding.previewEmail")}
              </span>
              <span className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                {t("branding.previewPassword")}
              </span>
            </div>
            <Button size="sm" className="mt-4 w-full" disabled>
              {t("branding.previewSignIn")}
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-10 max-w-2xl rounded-2xl border border-border bg-card p-6 sm:p-8">
        <h2 className="text-base font-semibold text-foreground">{t("dataSection.title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("dataSection.description")}</p>
        <Button variant="outline" className="mt-4" onClick={handleExportData}>
          <Download className="size-3.5" strokeWidth={1.5} />
          {t("dataSection.exportData")}
        </Button>

        <div className="mt-6 border-t border-destructive/20 pt-6">
          <h3 className="text-sm font-semibold text-destructive">
            {t("dataSection.dangerZoneTitle")}
          </h3>
          <Button
            variant="outline"
            className="mt-3 border-destructive/30 text-destructive hover:bg-destructive/10"
            onClick={() => setDeleteModalOpen(true)}
          >
            {t("dataSection.deleteAccount")}
          </Button>
        </div>
      </div>

      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            aria-hidden
            onClick={() => {
              setDeleteModalOpen(false);
              setDeleteConfirmText("");
            }}
            className="absolute inset-0 bg-black/30"
          />
          <div className={cn("relative w-full max-w-md rounded-2xl border border-border bg-card p-6", softShadow)}>
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <TriangleAlert className="size-5" strokeWidth={1.5} />
              </span>
              <div>
                <h2 className="text-base font-bold text-foreground">
                  {t("dataSection.deleteModalTitle")}
                </h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {t("dataSection.deleteModalDescription", { domain: account.domain })}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <label className="text-xs font-medium text-muted-foreground">
                {t("dataSection.deleteModalConfirmLabel", { domain: account.domain })}
              </label>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={account.domain}
                className="mt-1.5"
              />
            </div>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setDeleteConfirmText("");
                }}
              >
                {t("dataSection.deleteModalCancel")}
              </Button>
              <Button
                className="border-destructive/30 text-destructive hover:bg-destructive/10"
                variant="outline"
                disabled={deleteConfirmText !== account.domain}
                onClick={handleDeleteAccount}
              >
                {t("dataSection.deleteModalConfirm")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
