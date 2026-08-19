"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { Check, Copy, Image as ImageIcon, LogOut, TriangleAlert, Upload, X } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardShell } from "@/components/dashboard/shell";
import { LanguageSwitcher } from "@/components/marketing/language-switcher";
import { TeamLoginLinkCard, useLoginLinkCopy } from "@/components/dashboard/team-login-link";
import { useToast } from "@/components/dashboard/toast";
import { premiumButton, softShadow } from "@/components/onboarding/styles";
import { cn } from "@/lib/utils";
import { deleteAccount, getProfile, updateProfile } from "@/services/auth.services";
import {
  createDomainLogoUploadLink,
  getDomainBranding,
  getPublicDomainBranding,
  listDomains,
  setDomainCustomLoginHostname,
  updateDomainBranding,
  verifyDomainCustomLoginHostname,
} from "@/services/domain.services";
import { getCurrentSubscription } from "@/services/subscription.services";
import type { Domain, Subscription, SubscriptionStatus, User } from "@/types";

const DEFAULT_ACCENT_COLOR = "#FB6107";
const CUSTOM_LOGIN_HOSTNAME_TARGET_IP =
  process.env.NEXT_PUBLIC_CUSTOM_LOGIN_HOSTNAME_TARGET_IP || "76.76.21.21";

export default function SettingsPage() {
  const t = useTranslations("Dashboard.settingsPage");
  const tLink = useTranslations("Dashboard.loginLink");
  const router = useRouter();
  const { show } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [domain, setDomain] = useState<Domain | null>(null);
  const [checked, setChecked] = useState(false);

  const [companyName, setCompanyName] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [logoFileId, setLogoFileId] = useState<number | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null);
  const [accentColor, setAccentColor] = useState<string | null>(null);
  const [savingBranding, setSavingBranding] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [customHostname, setCustomHostname] = useState("");
  const [customHostnameVerified, setCustomHostnameVerified] = useState(false);
  const [savingHostname, setSavingHostname] = useState(false);
  const [verifyingHostname, setVerifyingHostname] = useState(false);

  const [subscription, setSubscription] = useState<Subscription | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const { loginUrl, copied, handleCopy } = useLoginLinkCopy(domain?.name ?? "");

  const [profile, setProfile] = useState<User | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [savingAccount, setSavingAccount] = useState(false);

  useEffect(() => {
    (async () => {
      const [domains, currentSubscription, user] = await Promise.all([
        listDomains(),
        getCurrentSubscription(),
        getProfile(),
      ]);
      if (domains.length === 0) {
        router.replace("/onboarding");
        return;
      }
      const primaryDomain = domains[0];
      setDomain(primaryDomain);
      setCustomHostname(primaryDomain.customLoginHostname ?? "");
      setCustomHostnameVerified(primaryDomain.customLoginHostnameVerified);
      setSubscription(currentSubscription);

      if (user) {
        setProfile(user);
        setFirstName(user.firstName);
        setLastName(user.lastName);
        setBusinessName(user.businessName ?? "");
      }

      const [branding, publicBranding] = await Promise.all([
        getDomainBranding(primaryDomain.id),
        getPublicDomainBranding(primaryDomain.name),
      ]);
      setCompanyName(branding?.companyName ?? "");
      setWelcomeMessage(branding?.welcomeMessage ?? "");
      setAccentColor(branding?.accentColor ?? null);
      setLogoFileId(branding?.logoFileId ?? null);
      setLogoPreviewUrl(publicBranding?.logoUrl ?? null);

      setChecked(true);
    })();
  }, [router]);

  async function handleSaveAccount() {
    setSavingAccount(true);
    const updated = await updateProfile({
      firstName,
      lastName,
      businessName: businessName || undefined,
    });
    setSavingAccount(false);
    if (!updated) {
      show(t("account.saveFailed"), "error");
      return;
    }
    setProfile(updated);
    show(t("account.saved"), "success");
  }

  if (!checked || !domain) return null;

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !domain) return;
    setUploadingLogo(true);
    const link = await createDomainLogoUploadLink(domain.id, {
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
    });
    if (!link) {
      setUploadingLogo(false);
      show(t("branding.logoUploadError"), "error");
      return;
    }
    const putResponse = await fetch(link.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    setUploadingLogo(false);
    if (!putResponse.ok) {
      show(t("branding.logoUploadError"), "error");
      return;
    }
    setLogoFileId(link.file.id);
    setLogoPreviewUrl(URL.createObjectURL(file));
  }

  async function handleSaveBranding() {
    if (!domain) return;
    setSavingBranding(true);
    const updated = await updateDomainBranding(domain.id, {
      companyName: companyName || null,
      welcomeMessage: welcomeMessage || null,
      accentColor,
      logoFileId,
    });
    setSavingBranding(false);
    if (!updated) {
      show(t("branding.saveFailed"), "error");
      return;
    }
    show(t("branding.saved"), "success");
  }

  async function handleSaveCustomHostname() {
    if (!domain || !customHostname.trim()) return;
    setSavingHostname(true);
    const updated = await setDomainCustomLoginHostname(domain.id, customHostname.trim());
    setSavingHostname(false);
    if (!updated) {
      show(t("customDomain.saveFailed"), "error");
      return;
    }
    setDomain(updated);
    setCustomHostname(updated.customLoginHostname ?? "");
    setCustomHostnameVerified(updated.customLoginHostnameVerified);
    show(t("customDomain.saved"), "success");
  }

  async function handleVerifyCustomHostname() {
    if (!domain) return;
    setVerifyingHostname(true);
    const verified = await verifyDomainCustomLoginHostname(domain.id);
    setVerifyingHostname(false);
    if (verified === null) {
      show(t("customDomain.verifyFailed"), "error");
      return;
    }
    setCustomHostnameVerified(verified);
  }

  async function handleDeleteAccount() {
    const ok = await deleteAccount();
    if (!ok) return;
    router.push("/");
  }

  return (
    <DashboardShell domain={domain.name} ownerName={profile ? `${profile.firstName} ${profile.lastName}`.trim() : ""}>
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        {t("title")}
      </h1>
      <p className="mt-1.5 max-w-2xl text-base text-muted-foreground">
        {t("subtitle")}
      </p>

      <div className="mt-8 max-w-2xl rounded-2xl border border-border bg-card p-6 sm:p-8">
        <h2 className="text-base font-semibold text-foreground">{t("account.title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("account.description")}</p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              {t("account.firstNameLabel")}
            </label>
            <Input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              {t("account.lastNameLabel")}
            </label>
            <Input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-1.5"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              {t("account.businessNameLabel")}
            </label>
            <Input
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder={t("account.businessNamePlaceholder")}
              className="mt-1.5"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              {t("account.emailLabel")}
            </label>
            <Input value={profile?.email ?? ""} disabled className="mt-1.5" />
          </div>
        </div>

        <Button
          className={cn("mt-5", premiumButton)}
          onClick={handleSaveAccount}
          disabled={savingAccount || !profile}
        >
          {savingAccount ? t("account.saving") : t("account.save")}
        </Button>

        <div className="mt-6 flex items-center justify-between gap-3 border-t border-border/70 pt-6">
          <p className="text-sm text-muted-foreground">{t("account.logoutDescription")}</p>
          <Button variant="outline" asChild>
            <Link href="/logout">
              <LogOut className="size-3.5" strokeWidth={1.5} />
              {t("account.logout")}
            </Link>
          </Button>
        </div>
      </div>

      <dl className="mt-8 max-w-md divide-y divide-border/70">
        <div className="flex items-center justify-between py-3.5">
          <dt className="text-sm text-muted-foreground">{t("domainLabel")}</dt>
          <dd className="text-sm font-semibold text-foreground">{domain.name}</dd>
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
          domain={domain.name}
          title={tLink("title")}
          description={tLink("description", {
            name: companyName || domain.name,
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
                {logoPreviewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoPreviewUrl}
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
                disabled={uploadingLogo}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="size-3.5" strokeWidth={1.5} />
                {uploadingLogo ? t("account.saving") : t("branding.upload")}
              </Button>
              {logoPreviewUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setLogoFileId(null);
                    setLogoPreviewUrl(null);
                  }}
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

          <Button
            className={cn("mt-5 w-full", premiumButton)}
            onClick={handleSaveBranding}
            disabled={savingBranding}
          >
            {savingBranding ? t("account.saving") : t("branding.save")}
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
              {logoPreviewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoPreviewUrl}
                  alt={t("branding.logoAlt")}
                  className="size-full object-contain"
                />
              ) : (
                <ImageIcon className="size-5 text-muted-foreground" strokeWidth={1.5} />
              )}
            </span>
            <p className="mt-3 text-sm font-semibold text-foreground">
              {t("branding.previewWelcome", { name: companyName || domain.name })}
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
        <h2 className="text-base font-semibold text-foreground">{t("customDomain.title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("customDomain.description", { domain: domain.name })}
        </p>

        <div className="mt-4">
          <label className="text-xs font-medium text-muted-foreground">
            {t("customDomain.hostnameLabel")}
          </label>
          <div className="mt-1.5 flex gap-2">
            <Input
              value={customHostname}
              onChange={(e) => setCustomHostname(e.target.value)}
              placeholder={t("customDomain.hostnamePlaceholder", { domain: domain.name })}
            />
            <Button
              type="button"
              variant="outline"
              disabled={savingHostname || !customHostname.trim()}
              onClick={handleSaveCustomHostname}
            >
              {t("customDomain.save")}
            </Button>
          </div>
        </div>

        {domain.customLoginHostname && (
          <div className="mt-4 rounded-lg border border-border/50 bg-muted/30 p-3.5">
            <p className="text-xs text-muted-foreground">{t("customDomain.instructions")}</p>
            <div className="mt-2.5 grid grid-cols-3 gap-2 font-mono text-xs">
              <div>
                <p className="text-[10px] uppercase text-muted-foreground">
                  {t("customDomain.recordType")}
                </p>
                <p className="text-foreground">A</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-muted-foreground">
                  {t("customDomain.recordName")}
                </p>
                <p className="truncate text-foreground">{domain.customLoginHostname}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-muted-foreground">
                  {t("customDomain.recordValue")}
                </p>
                <p className="text-foreground">{CUSTOM_LOGIN_HOSTNAME_TARGET_IP}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p
                className={cn(
                  "text-xs font-medium",
                  customHostnameVerified ? "text-emerald-700" : "text-amber-700",
                )}
              >
                {customHostnameVerified
                  ? t("customDomain.verified")
                  : t("customDomain.notVerified")}
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={verifyingHostname}
                onClick={handleVerifyCustomHostname}
              >
                {verifyingHostname ? t("customDomain.verifying") : t("customDomain.verify")}
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-10 max-w-2xl rounded-2xl border border-border bg-card p-6 sm:p-8">
        <h2 className="text-base font-semibold text-foreground">{t("billing.title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("billing.description")}</p>

        {!subscription ? (
          <p className="mt-4 text-sm text-muted-foreground">{t("billing.noSubscription")}</p>
        ) : (
          <dl className="mt-4 flex flex-col gap-3">
            <div className="flex items-center justify-between text-sm">
              <dt className="text-muted-foreground">{t("billing.plan")}</dt>
              <dd className="font-medium text-foreground capitalize">{subscription.planId}</dd>
            </div>
            <div className="flex items-center justify-between text-sm">
              <dt className="text-muted-foreground">{t("billing.status")}</dt>
              <dd className="font-medium text-foreground">
                {t(`billing.statusValues.${subscription.status as SubscriptionStatus}`)}
              </dd>
            </div>
            <div className="flex items-center justify-between text-sm">
              <dt className="text-muted-foreground">{t("billing.mailboxes")}</dt>
              <dd className="font-medium text-foreground">{subscription.mailboxQuantity}</dd>
            </div>
            {subscription.currentPeriodEnd && (
              <div className="flex items-center justify-between text-sm">
                <dt className="text-muted-foreground">
                  {t("billing.renewsOn", {
                    date: new Date(subscription.currentPeriodEnd).toLocaleDateString(),
                  })}
                </dt>
              </div>
            )}
          </dl>
        )}
      </div>

      <div className="mt-10 max-w-2xl rounded-2xl border border-border bg-card p-6 sm:p-8">
        <h2 className="text-base font-semibold text-foreground">{t("dataSection.title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("dataSection.description")}</p>

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
                  {t("dataSection.deleteModalDescription", { domain: domain.name })}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <label className="text-xs font-medium text-muted-foreground">
                {t("dataSection.deleteModalConfirmLabel", { domain: domain.name })}
              </label>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={domain.name}
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
                disabled={deleteConfirmText !== domain.name}
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
