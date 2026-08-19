"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Archive,
  ArchiveRestore,
  Baseline,
  Bold,
  Briefcase,
  Building2,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Facebook,
  FileText,
  Folder,
  FolderInput,
  Forward,
  Globe,
  Image as ImageIcon,
  Inbox,
  IndentDecrease,
  IndentIncrease,
  Instagram,
  Italic,
  KeyRound,
  Link2,
  Linkedin,
  List,
  ListOrdered,
  Loader2,
  Lock,
  LogOut,
  Mail,
  MailOpen,
  MapPin,
  Maximize2,
  Menu,
  MessageCircle,
  Mic,
  Minimize2,
  Moon,
  Paperclip,
  Pause,
  Phone,
  Play,
  Plus,
  Reply,
  Search,
  Send,
  Server,
  SettingsIcon,
  ShieldAlert,
  ShieldCheck,
  Signature,
  Smartphone,
  Sparkles,
  Square,
  SquarePen,
  Star,
  Sun,
  Trash2,
  Type,
  Underline,
  UserPlus,
  UserRound,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/dashboard/toast";
import { LanguageSwitcher } from "@/components/marketing/language-switcher";
import { premiumButton } from "@/components/onboarding/styles";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";
import {
  generateImportedMessages,
  hasVoiceNotes,
  loadAccount,
  saveAccount,
  type EmailAttachment,
  type EmailMessage,
  type MailFolder,
  type MailPreferences,
  type OnboardingAccount,
  type SignatureSettings,
} from "@/lib/onboarding";
import { getSignature, updateSignature } from "@/services/signature.services";
import { updateSignatureSchema } from "@/schemas/signature.schemas";
import type {
  Folder as FolderRecord,
  Mail as MailRecord,
  Signature as SignatureRecord,
  TwoFactorSetup,
} from "@/types";
import {
  cancelScheduledMail,
  changeMailAccountPassword,
  disableTwoFactor,
  enableTwoFactor,
  forwardMail as forwardMailApi,
  getDrafts,
  getMailAccountProfile,
  getReceivedMails,
  getScheduledMails,
  getSentMails,
  getSpamMails,
  getTrashMails,
  markMailImportant,
  markMailRead,
  markMailSpam,
  moveMailToFolder,
  permanentlyDeleteMail,
  restoreMail as restoreMailApi,
  scheduleMail as scheduleMailApi,
  sendMail as sendMailApi,
  setForwardingEmail,
  setupTwoFactorWithQr,
  trashMail as trashMailApi,
  updateForwardingPreferences,
  updateMailAccountProfile,
  uploadFiles,
  verifyForwardingEmail,
} from "@/services/mail.services";
import {
  createFolder as createFolderApi,
  deleteFolder as deleteFolderApi,
  getFolders,
} from "@/services/folder.services";
import { createContact as createContactApi } from "@/services/contact.services";

/** Reads a display name out of a `"Name" <email>` from-header; falls back to the local part of the address. */
function extractDisplayName(raw: string, fallbackEmail: string): string {
  const match = raw.match(/^"?([^"<]+)"?\s*</);
  return match ? match[1].trim() : fallbackEmail.split("@")[0];
}

function extractEmailAddress(raw: string): string {
  const match = raw.match(/<([^>]+)>/);
  return match ? match[1] : raw;
}

/** System folder is derived from status/direction/flags — the backend has no single "folder" field. */
function mailFolder(mail: MailRecord): MailFolder {
  if (mail.deleted) return "trash";
  if (mail.isSpam) return "spam";
  if (mail.status === "draft") return "drafts";
  if (mail.status === "scheduled") return "scheduled";
  if (mail.direction === "sent") return "sent";
  return "inbox";
}

/**
 * Adapts a real `Mail` record into the `EmailMessage` shape the rest of this
 * (very large) component already renders, so real data can flow through
 * existing UI/interaction code unchanged. `id` is stringified here and
 * converted back to a number only where mutation endpoints need it.
 */
function mailToEmailMessage(mail: MailRecord): EmailMessage {
  const fromEmail = extractEmailAddress(mail.fromEmail);
  return {
    id: String(mail.id),
    folder: mailFolder(mail),
    fromName: extractDisplayName(mail.fromEmail, fromEmail),
    fromEmail,
    toEmail: mail.toAddresses?.[0] ?? "",
    ccEmail: mail.ccAddresses?.length ? mail.ccAddresses.join(", ") : undefined,
    bccEmail: mail.bccAddresses?.length ? mail.bccAddresses.join(", ") : undefined,
    subject: mail.subject || "(no subject)",
    preview: (mail.bodyText ?? "").slice(0, 80),
    body: mail.bodyText ?? mail.bodyHtml ?? "",
    date: mail.createdAt,
    read: mail.isRead,
    starred: mail.important,
    folderId: mail.folderId,
    scheduledFor: mail.scheduledAt ?? undefined,
    archived: false,
    attachments: undefined,
    confidential: false,
  };
}

async function fetchAllMailMessages(): Promise<EmailMessage[]> {
  const [received, sent, drafts, scheduled, trash, spam] = await Promise.all([
    getReceivedMails(),
    getSentMails(),
    getDrafts(),
    getScheduledMails(),
    getTrashMails(),
    getSpamMails(),
  ]);
  const byId = new Map<number, MailRecord>();
  for (const mail of [...received, ...sent, ...drafts, ...scheduled, ...trash, ...spam]) {
    byId.set(mail.id, mail);
  }
  return Array.from(byId.values()).map(mailToEmailMessage);
}

function signatureToSettings(signature: SignatureRecord): SignatureSettings {
  return {
    name: signature.name ?? "",
    jobTitle: signature.jobTitle ?? "",
    includePhoto: signature.includePhoto,
    phone: signature.phone ?? "",
    website: signature.website ?? "",
    address: signature.address ?? "",
    linkedin: signature.linkedin ?? "",
    facebook: signature.facebook ?? "",
    instagram: signature.instagram ?? "",
    includeInNewEmails: signature.includeInNewEmails,
    includeInReplies: signature.includeInReplies,
  };
}

const ATTACHMENT_ICONS: Record<EmailAttachment["type"], LucideIcon> = {
  pdf: FileText,
  image: ImageIcon,
  doc: FileText,
  voice: Mic,
};

const FONT_FAMILIES = [
  { label: "Sans Serif", value: "Arial, sans-serif" },
  { label: "Serif", value: "Georgia, serif" },
  { label: "Monospace", value: "'Courier New', monospace" },
  { label: "Comic Sans", value: "'Comic Sans MS', cursive" },
];

const FONT_SIZES = [
  { labelKey: "fontSizeSmall", value: "2" },
  { labelKey: "fontSizeNormal", value: "3" },
  { labelKey: "fontSizeLarge", value: "5" },
  { labelKey: "fontSizeHuge", value: "7" },
] as const;

function formatFileSize(kb: number) {
  if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`;
  return `${kb} KB`;
}

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

const FOLDER_ICONS: Record<MailFolder, LucideIcon> = {
  inbox: Inbox,
  important: Star,
  sent: Send,
  drafts: FileText,
  scheduled: Clock,
  spam: ShieldAlert,
  trash: Trash2,
};

const FOLDER_ORDER: MailFolder[] = [
  "inbox",
  "important",
  "sent",
  "drafts",
  "scheduled",
  "spam",
  "trash",
];

const AVATAR_PALETTE = [
  "bg-rose-500/15 text-rose-600",
  "bg-blue-500/15 text-blue-600",
  "bg-emerald-500/15 text-emerald-600",
  "bg-amber-500/15 text-amber-600",
  "bg-violet-500/15 text-violet-600",
  "bg-cyan-500/15 text-cyan-600",
  "bg-primary/15 text-primary",
  "bg-pink-500/15 text-pink-600",
];

function hashSeed(value: string) {
  let h = 0;
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) >>> 0;
  return h;
}

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

function ContactAvatar({
  name,
  email,
  className,
}: {
  name: string;
  email: string;
  className?: string;
}) {
  const color = AVATAR_PALETTE[hashSeed(email || name) % AVATAR_PALETTE.length];
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-lg font-semibold",
        color,
        className,
      )}
    >
      {initialsFor(name)}
    </span>
  );
}

interface SenderContact {
  name: string;
  email: string;
}

function SenderPreviewCard({
  name,
  email,
  onSendMail,
  onScheduleMail,
  onAddToContacts,
  onViewDetails,
  children,
}: {
  name: string;
  email: string;
  onSendMail: (email: string) => void;
  onScheduleMail: (email: string) => void;
  onAddToContacts: (email: string) => void;
  onViewDetails: (contact: SenderContact) => void;
  children: ReactNode;
}) {
  const t = useTranslations("Dashboard.mailPage");
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleEnter() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }

  function handleLeave() {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  }

  const quickActionClass =
    "flex size-9 items-center justify-center rounded-lg text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800";

  return (
    <span
      className="relative inline-flex shrink-0"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {children}
      {open && (
        <div className="absolute top-full left-0 z-50 mt-2 w-80 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl shadow-slate-300/60 dark:shadow-black/40">
          <div className="flex items-center gap-3">
            <ContactAvatar name={name} email={email} className="size-12 shrink-0 text-base" />
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-slate-900 dark:text-slate-50">{name}</p>
              <p className="truncate text-sm text-slate-500 dark:text-slate-400">{email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSendMail(email)}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:bg-gradient-to-b hover:from-primary hover:to-primary-dark hover:shadow-lg hover:shadow-primary/25"
          >
            <Send className="size-4" strokeWidth={1.5} />
            {t("composeToContact")}
          </button>

          <div className="mt-4 flex items-center justify-center gap-8 border-t border-slate-100 dark:border-slate-800 pt-4">
            <button
              type="button"
              title={t("addToContacts")}
              onClick={() => onAddToContacts(email)}
              className={quickActionClass}
            >
              <UserPlus className="size-4" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              title={t("scheduleMailTo")}
              onClick={() => onScheduleMail(email)}
              className={quickActionClass}
            >
              <Clock className="size-4" strokeWidth={1.5} />
            </button>
          </div>
          <button
            type="button"
            onClick={() => onViewDetails({ name, email })}
            className="mt-1 flex w-full items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-100"
          >
            {t("viewDetails")}
            <ChevronRight className="size-3.5" strokeWidth={1.5} />
          </button>
        </div>
      )}
    </span>
  );
}

function ContactDetailPanel({
  contact,
  messages,
  isTeam,
  onClose,
  onOpenMessage,
  onSendMail,
}: {
  contact: SenderContact;
  messages: EmailMessage[];
  isTeam: boolean;
  onClose: () => void;
  onOpenMessage: (message: EmailMessage) => void;
  onSendMail: (email: string) => void;
}) {
  const t = useTranslations("Dashboard.mailPage");
  const locale = useLocale();
  const { show } = useToast();
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  const interactions = messages
    .filter((m) => m.fromEmail === contact.email || m.toEmail === contact.email)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const organization = isTeam ? t("teamContacts") : contact.email.split("@")[1];

  return (
    <div className="fixed inset-0 z-50">
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-black/30 transition-opacity duration-300",
          entered ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        className={cn(
          "absolute top-0 right-0 flex h-full w-full max-w-md flex-col bg-white dark:bg-slate-900 shadow-2xl transition-transform duration-300 ease-out",
          entered ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{t("viewDetails")}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("cancel")}
            className="flex size-7 items-center justify-center rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300"
          >
            <X className="size-4" strokeWidth={1.5} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          <div className="flex flex-col items-center text-center">
            <ContactAvatar
              name={contact.name}
              email={contact.email}
              className="size-16 text-xl"
            />
            <p className="mt-3 text-base font-semibold text-slate-900 dark:text-slate-50">{contact.name}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{contact.email}</p>
            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                title={t("composeToContact")}
                onClick={() => onSendMail(contact.email)}
                className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20"
              >
                <Mail className="size-4" strokeWidth={1.5} />
              </button>
              <button
                type="button"
                title={t("chat")}
                onClick={() => show(t("chatComingSoon"), "info")}
                className="flex size-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                <MessageCircle className="size-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 dark:border-slate-800 pt-5">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="size-4 shrink-0 text-slate-400 dark:text-slate-500" strokeWidth={1.5} />
              <span className="min-w-0 truncate text-slate-700 dark:text-slate-300">{contact.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="size-4 shrink-0 text-slate-400 dark:text-slate-500" strokeWidth={1.5} />
              <span className="text-slate-400 dark:text-slate-500">{t("phoneNotProvided")}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Building2 className="size-4 shrink-0 text-slate-400 dark:text-slate-500" strokeWidth={1.5} />
              <span className="min-w-0 truncate text-slate-700 dark:text-slate-300">{organization}</span>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-100 dark:border-slate-800 pt-5">
            <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {t("recentInteractions")}
            </h3>
            {interactions.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">{t("noInteractions")}</p>
            ) : (
              <div className="mt-3 flex flex-col gap-1.5">
                {interactions.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => onOpenMessage(m)}
                    className="flex items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">{m.subject}</p>
                      <p className="truncate text-xs text-muted-foreground">{m.preview}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-medium tracking-wide text-slate-500 dark:text-slate-400 uppercase">
                      {m.folder}
                    </span>
                    <span className="shrink-0 text-xs tabular-nums text-slate-400 dark:text-slate-500">
                      {formatMessageTime(m.date, locale)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 border-t border-slate-100 dark:border-slate-800 p-4">
          <Button
            className={cn(premiumButton, "w-full")}
            onClick={() => show(t("saveContactComingSoon"), "info")}
          >
            <UserPlus className="size-4" strokeWidth={1.5} />
            {t("saveContact")}
          </Button>
        </div>
      </div>
    </div>
  );
}

function formatMessageTime(date: string, locale: string) {
  const d = new Date(date);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-US", {
    hour: sameDay ? "2-digit" : undefined,
    minute: sameDay ? "2-digit" : undefined,
    day: sameDay ? undefined : "2-digit",
    month: sameDay ? undefined : "short",
  }).format(d);
}

function escapeSignatureHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildSignatureHtml(s: SignatureSettings, avatarDataUrl: string | null): string {
  const hasContent = Boolean(
    s.name || s.jobTitle || s.phone || s.website || s.address || s.linkedin || s.facebook || s.instagram,
  );
  if (!hasContent) return "";

  const contact = [s.phone, s.website].filter(Boolean).map(escapeSignatureHtml).join(" &middot; ");
  const socials = [
    s.linkedin && { label: "in", handle: s.linkedin },
    s.facebook && { label: "f", handle: s.facebook },
    s.instagram && { label: "IG", handle: s.instagram },
  ].filter((item): item is { label: string; handle: string } => Boolean(item));

  const photoHtml =
    s.includePhoto && avatarDataUrl
      ? `<img src="${avatarDataUrl}" alt="" width="44" height="44" style="width:44px;height:44px;border-radius:10px;object-fit:cover;flex-shrink:0;display:block;" />`
      : s.includePhoto
        ? `<span style="display:inline-flex;align-items:center;justify-content:center;width:44px;height:44px;border-radius:10px;background:color-mix(in oklab, var(--primary) 12%, white);color:var(--primary);font-size:16px;font-weight:600;flex-shrink:0;">${escapeSignatureHtml((s.name || "?").charAt(0).toUpperCase())}</span>`
        : "";

  const lines: string[] = [];
  if (s.name) {
    lines.push(
      `<div style="font-weight:600;font-size:14px;color:#0f172a;">${escapeSignatureHtml(s.name)}</div>`,
    );
  }
  if (s.jobTitle) {
    lines.push(
      `<div style="font-size:13px;color:#64748b;">${escapeSignatureHtml(s.jobTitle)}</div>`,
    );
  }
  if (contact) lines.push(`<div style="font-size:13px;color:#64748b;">${contact}</div>`);
  if (s.address) {
    lines.push(
      `<div style="font-size:13px;color:#64748b;">${escapeSignatureHtml(s.address)}</div>`,
    );
  }
  if (socials.length) {
    const badges = socials
      .map(
        ({ label, handle }) =>
          `<span title="${escapeSignatureHtml(handle)}" style="display:inline-flex;align-items:center;justify-content:center;min-width:20px;height:20px;padding:0 5px;border-radius:9999px;background:#f1f5f9;color:#475569;font-size:10px;font-weight:600;margin-right:6px;">${label}</span>`,
      )
      .join("");
    lines.push(`<div style="margin-top:2px;">${badges}</div>`);
  }

  return `<div style="display:flex;align-items:flex-start;gap:12px;">${photoHtml}<div style="display:flex;flex-direction:column;gap:2px;">${lines.join("")}</div></div>`;
}

type Selection = { type: "folder"; folder: MailFolder } | { type: "custom"; id: number; name: string };

interface ComposeSendPayload {
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  bodyText: string;
  attachments: EmailAttachment[];
  confidential: boolean;
  scheduledFor?: string;
}

function ComposeDialog({
  onClose,
  onSend,
  signature,
  autoInsertSignature,
  onRequestCreateSignature,
  composerDisplayName,
  composerAvatarDataUrl,
  voiceNotesEnabled,
  initialTo,
  initialScheduleEnabled,
}: {
  onClose: () => void;
  onSend: (payload: ComposeSendPayload) => void;
  signature: string;
  autoInsertSignature?: boolean;
  onRequestCreateSignature?: () => void;
  composerDisplayName: string;
  composerAvatarDataUrl: string | null;
  voiceNotesEnabled: boolean;
  initialTo?: string;
  initialScheduleEnabled?: boolean;
}) {
  const t = useTranslations("Dashboard.mailPage");
  const [to, setTo] = useState(initialTo ?? "");
  const [toEditing, setToEditing] = useState(!initialTo);
  const [cc, setCc] = useState("");
  const [ccVisible, setCcVisible] = useState(false);
  const [bcc, setBcc] = useState("");
  const [bccVisible, setBccVisible] = useState(false);
  const [subject, setSubject] = useState("");
  const [scheduleEnabled, setScheduleEnabled] = useState(initialScheduleEnabled ?? false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [expanded, setExpanded] = useState(false);
  const composerRef = useRef<ComposerBodyHandle>(null);

  function handleSubmit() {
    const scheduledFor =
      scheduleEnabled && scheduleDate ? new Date(scheduleDate).toISOString() : undefined;
    const content = composerRef.current?.getContent();
    onSend({
      to: to.trim(),
      cc: cc.trim() || undefined,
      bcc: bcc.trim() || undefined,
      subject: subject.trim(),
      bodyText: content?.bodyText ?? "",
      attachments: content?.attachments ?? [],
      confidential: content?.confidential ?? false,
      scheduledFor,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div aria-hidden onClick={onClose} className="absolute inset-0 bg-black/30" />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={cn(
          "relative flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-slate-900 transition-all duration-300 ease-in-out",
          expanded ? "h-[50vh] w-[50vw]" : "w-full max-w-xl",
        )}
      >
        <div className="flex shrink-0 items-center justify-between rounded-t-2xl bg-slate-50/70 dark:bg-slate-800/70 px-5 py-3.5">
          <h2 className="text-sm font-semibold text-foreground">{t("composeTitle")}</h2>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-label={expanded ? t("collapse") : t("expand")}
              title={expanded ? t("collapse") : t("expand")}
              className="flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {expanded ? (
                <Minimize2 className="size-4" strokeWidth={1.5} />
              ) : (
                <Maximize2 className="size-4" strokeWidth={1.5} />
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label={t("cancel")}
              title={t("cancel")}
              className="flex size-7 items-center justify-center rounded-full text-slate-500 dark:text-slate-400 hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="size-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
        <div
          className={cn(
            "flex flex-col gap-3 p-5",
            expanded && "min-h-0 flex-1 overflow-y-auto",
          )}
        >
          <div className="flex items-center gap-2 rounded-lg px-2 py-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800">
            <span className="shrink-0 text-sm text-slate-500 dark:text-slate-400">{t("sendingTo")}</span>
            {!toEditing && to.trim() ? (
              <button
                type="button"
                onClick={() => setToEditing(true)}
                className="inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 py-1 pr-1 pl-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                <span className="truncate">{to}</span>
                <span
                  role="button"
                  tabIndex={0}
                  aria-label={t("cancel")}
                  onClick={(e) => {
                    e.stopPropagation();
                    setTo("");
                  }}
                  className="flex size-4 shrink-0 items-center justify-center rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-50"
                >
                  <X className="size-3" strokeWidth={1.5} />
                </span>
              </button>
            ) : (
              <input
                autoFocus
                value={to}
                onChange={(e) => setTo(e.target.value)}
                onBlur={() => {
                  if (to.trim()) setToEditing(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && to.trim()) {
                    e.preventDefault();
                    setToEditing(false);
                  }
                }}
                className="min-w-[140px] flex-1 bg-transparent text-sm text-foreground outline-none"
              />
            )}
            <div className="ml-auto flex shrink-0 items-center gap-3">
              {!ccVisible && (
                <button
                  type="button"
                  onClick={() => setCcVisible(true)}
                  className="px-1 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50"
                >
                  {t("addCc")}
                </button>
              )}
              {!bccVisible && (
                <button
                  type="button"
                  onClick={() => setBccVisible(true)}
                  className="px-1 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50"
                >
                  {t("addBcc")}
                </button>
              )}
            </div>
          </div>
          {ccVisible && (
            <div className="flex items-center gap-2 rounded-lg px-2 py-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800">
              <span className="w-9 shrink-0 text-sm font-semibold text-slate-700 dark:text-slate-300">{t("cc")}</span>
              <input
                autoFocus
                value={cc}
                onChange={(e) => setCc(e.target.value)}
                className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  setCcVisible(false);
                  setCc("");
                }}
                aria-label={t("cancel")}
                className="flex size-6 shrink-0 items-center justify-center rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300"
              >
                <X className="size-3.5" strokeWidth={1.5} />
              </button>
            </div>
          )}
          {bccVisible && (
            <div className="flex items-center gap-2 rounded-lg px-2 py-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800">
              <span className="w-9 shrink-0 text-sm font-semibold text-slate-700 dark:text-slate-300">{t("bcc")}</span>
              <input
                autoFocus
                value={bcc}
                onChange={(e) => setBcc(e.target.value)}
                className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  setBccVisible(false);
                  setBcc("");
                }}
                aria-label={t("cancel")}
                className="flex size-6 shrink-0 items-center justify-center rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300"
              >
                <X className="size-3.5" strokeWidth={1.5} />
              </button>
            </div>
          )}
          <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
          <div className="rounded-lg px-2 py-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800">
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={t("subjectPlaceholder")}
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-slate-400"
            />
          </div>
          <div className={cn("flex flex-col", expanded && "min-h-0 flex-1")}>
            <ComposerBody
              ref={composerRef}
              signature={signature}
              autoInsertSignature={autoInsertSignature}
              onRequestCreateSignature={onRequestCreateSignature}
              composerDisplayName={composerDisplayName}
              composerAvatarDataUrl={composerAvatarDataUrl}
              voiceNotesEnabled={voiceNotesEnabled}
              placeholder={t("bodyPlaceholder")}
              grow={expanded}
              schedule={{
                enabled: scheduleEnabled,
                date: scheduleDate,
                onToggle: () => setScheduleEnabled((v) => !v),
                onDateChange: setScheduleDate,
              }}
              footer={
                <Button
                  size="sm"
                  className={cn(premiumButton)}
                  disabled={!to.trim() || (scheduleEnabled && !scheduleDate)}
                  onClick={handleSubmit}
                >
                  <Send className="size-3.5" strokeWidth={1.5} />
                  {scheduleEnabled ? t("scheduleSend") : t("send")}
                </Button>
              }
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors",
        checked ? "bg-primary" : "bg-slate-200 dark:bg-slate-700",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 size-5 rounded-full bg-white dark:bg-slate-900 shadow-sm transition-transform",
          checked && "translate-x-5",
        )}
      />
    </button>
  );
}

function SettingsModal({
  title,
  onClose,
  footer,
  children,
}: {
  title: string;
  onClose: () => void;
  footer?: ReactNode;
  children: ReactNode;
}) {
  const t = useTranslations("Dashboard.mailPage");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div aria-hidden onClick={onClose} className="absolute inset-0 bg-black/30" />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="relative flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl shadow-slate-300/60 dark:shadow-black/40"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("cancel")}
            className="flex size-7 items-center justify-center rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300"
          >
            <X className="size-4" strokeWidth={1.5} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">{children}</div>
        {footer && (
          <div className="flex shrink-0 items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800 px-6 py-4">
            {footer}
          </div>
        )}
      </motion.div>
    </div>
  );
}

function SettingsCard({
  icon: Icon,
  iconWashClassName,
  title,
  description,
  onClick,
}: {
  icon: LucideIcon;
  iconWashClassName: string;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-start gap-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 p-6 text-left shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md"
    >
      <span
        className={cn(
          "flex size-11 items-center justify-center rounded-xl transition-colors duration-300 group-hover:text-primary",
          iconWashClassName,
        )}
      >
        <Icon className="size-5" strokeWidth={1.5} />
      </span>
      <div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </button>
  );
}

function ThemeMenu({
  theme,
  onSelect,
}: {
  theme: MailPreferences["theme"];
  onSelect: (theme: MailPreferences["theme"]) => void;
}) {
  const t = useTranslations("Dashboard.mailPage");

  const options: { value: MailPreferences["theme"]; label: string; icon: LucideIcon }[] = [
    { value: "light", label: t("settings.themeLight"), icon: Sun },
    { value: "dark", label: t("settings.themeDark"), icon: Moon },
  ];

  return (
    <div className="absolute top-4 right-4 z-30 flex items-center gap-0.5 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 p-1 shadow-sm">
      {options.map(({ value, label, icon: Icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            title={label}
            onClick={() => onSelect(value)}
            className={cn(
              "flex size-7 items-center justify-center rounded-full transition-colors",
              active
                ? "bg-white dark:bg-slate-900 text-primary shadow-sm"
                : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400",
            )}
          >
            <Icon className="size-4" strokeWidth={1.5} />
          </button>
        );
      })}
    </div>
  );
}

function ProfileModal({
  account,
  displayName,
  onClose,
  onSave,
}: {
  account: OnboardingAccount;
  displayName: string;
  onClose: () => void;
  onSave: (payload: {
    ownerName: string;
    jobTitle: string;
    avatarDataUrl: string | null;
  }) => Promise<boolean>;
}) {
  const t = useTranslations("Dashboard.mailPage");
  const { show } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [ownerName, setOwnerName] = useState(displayName);
  const [jobTitle, setJobTitle] = useState(account.mailPreferences.jobTitle);
  const [avatarDataUrl, setAvatarDataUrl] = useState(account.mailPreferences.avatarDataUrl);
  const [avatarUrl, setAvatarUrl] = useState(account.mailPreferences.avatarDataUrl);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarDataUrl(reader.result as string);
    reader.readAsDataURL(file);

    setUploadingAvatar(true);
    const data = new Uint8Array(await file.arrayBuffer());
    const [uploaded] = await uploadFiles([
      { name: file.name, type: file.type, size: file.size, data },
    ]);
    setUploadingAvatar(false);
    if (uploaded) {
      setAvatarUrl(uploaded.publicUrl);
    } else {
      show(t("attachmentUploadFailed"), "error");
    }
  }

  async function handleSave() {
    setSaving(true);
    const ok = await onSave({ ownerName, jobTitle, avatarDataUrl: avatarUrl });
    setSaving(false);
    if (!ok) {
      show(t("settings.profileSaveError"), "error");
      return;
    }
    show(t("settings.profileSaved"), "success");
    onClose();
  }

  return (
    <SettingsModal
      title={t("settings.profileTitle")}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button
            className={cn(premiumButton)}
            onClick={handleSave}
            disabled={uploadingAvatar || saving}
          >
            {saving ? t("saving") : t("save")}
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center gap-4">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="group relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary"
        >
          {avatarDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarDataUrl} alt="" className="size-full object-cover" />
          ) : (
            <span className="text-xl font-semibold">
              {(ownerName || "?").charAt(0).toUpperCase()}
            </span>
          )}
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-full bg-slate-900/60 text-white opacity-0 transition-opacity group-hover:opacity-100">
            <Camera className="size-4" strokeWidth={1.5} />
            <span className="text-[11px] font-medium">{t("settings.editPhoto")}</span>
          </span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          className="hidden"
        />
      </div>

      <div className="mt-6 flex flex-col gap-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground">{t("displayName")}</label>
          <Input
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            className="mt-1.5"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            {t("settings.jobTitle")}
          </label>
          <Input
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder={t("settings.jobTitlePlaceholder")}
            className="mt-1.5"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            {t("settings.preferredLanguage")}
          </label>
          <div className="mt-1.5">
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </SettingsModal>
  );
}

function SecurityModal({
  account,
  onClose,
  onTwoFactorChanged,
}: {
  account: OnboardingAccount;
  onClose: () => void;
  onTwoFactorChanged: (enabled: boolean) => void;
}) {
  const t = useTranslations("Dashboard.mailPage");
  const { show } = useToast();
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [twoFactorSetup, setTwoFactorSetup] = useState<
    (TwoFactorSetup & { qrDataUrl: string }) | null
  >(null);
  const [settingUpTwoFactor, setSettingUpTwoFactor] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [confirmingTwoFactor, setConfirmingTwoFactor] = useState(false);
  const [disablingOpen, setDisablingOpen] = useState(false);
  const [disableCurrentPassword, setDisableCurrentPassword] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [disablingTwoFactor, setDisablingTwoFactor] = useState(false);

  async function handleStartTwoFactorSetup() {
    setSettingUpTwoFactor(true);
    const setup = await setupTwoFactorWithQr();
    setSettingUpTwoFactor(false);
    if (!setup) {
      show(t("settings.twoFactorSetupError"), "error");
      return;
    }
    setTwoFactorSetup(setup);
  }

  async function handleConfirmTwoFactor() {
    setConfirmingTwoFactor(true);
    const ok = await enableTwoFactor({ code: twoFactorCode });
    setConfirmingTwoFactor(false);
    if (!ok) {
      show(t("settings.twoFactorInvalidCode"), "error");
      return;
    }
    setTwoFactorSetup(null);
    setTwoFactorCode("");
    onTwoFactorChanged(true);
    show(t("settings.twoFactorEnabledToast"), "success");
  }

  async function handleDisableTwoFactor() {
    setDisablingTwoFactor(true);
    const ok = await disableTwoFactor({
      currentPassword: disableCurrentPassword,
      code: disableCode,
    });
    setDisablingTwoFactor(false);
    if (!ok) {
      show(t("settings.twoFactorInvalidCode"), "error");
      return;
    }
    setDisablingOpen(false);
    setDisableCurrentPassword("");
    setDisableCode("");
    onTwoFactorChanged(false);
    show(t("settings.twoFactorDisabledToast"), "success");
  }

  async function handleUpdatePassword() {
    if (!currentPassword || !newPassword || newPassword !== confirmPassword) {
      show(t("settings.passwordMismatch"), "error");
      return;
    }
    setUpdatingPassword(true);
    const ok = await changeMailAccountPassword({ currentPassword, newPassword });
    setUpdatingPassword(false);
    if (!ok) {
      show(t("settings.passwordUpdateError"), "error");
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordOpen(false);
    show(t("settings.passwordUpdated"), "success");
  }

  return (
    <SettingsModal title={t("settings.securityTitle")} onClose={onClose}>
      <div className="flex flex-col divide-y divide-slate-100">
        <div className="pb-4">
          <button
            type="button"
            onClick={() => setPasswordOpen((v) => !v)}
            className="flex w-full items-center justify-between gap-3 text-left"
          >
            <span className="flex items-center gap-3">
              <KeyRound className="size-4 text-slate-400 dark:text-slate-500" strokeWidth={1.5} />
              <span className="text-sm font-medium text-slate-900 dark:text-slate-50">
                {t("settings.changePassword")}
              </span>
            </span>
            <ChevronRight
              className={cn(
                "size-4 text-muted-foreground transition-transform",
                passwordOpen && "rotate-90",
              )}
              strokeWidth={1.5}
            />
          </button>
          {passwordOpen && (
            <div className="mt-4 flex flex-col gap-3 pl-7">
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder={t("settings.currentPassword")}
              />
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t("settings.newPassword")}
              />
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t("settings.confirmPassword")}
              />
              <Button
                size="sm"
                className={cn("self-start", premiumButton)}
                onClick={handleUpdatePassword}
                disabled={updatingPassword}
              >
                {updatingPassword ? t("saving") : t("settings.updatePassword")}
              </Button>
            </div>
          )}
        </div>

        <div className="py-4">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-3">
              <ShieldCheck className="size-4 text-slate-400 dark:text-slate-500" strokeWidth={1.5} />
              <span className="flex flex-col">
                <span className="text-sm font-medium text-slate-900 dark:text-slate-50">
                  {t("settings.twoFactorAuth")}
                </span>
                <span className="text-xs text-muted-foreground">
                  {account.mailPreferences.twoFactorEnabled
                    ? t("settings.twoFactorEnabled")
                    : t("settings.twoFactorDisabled")}
                </span>
              </span>
            </span>
            {account.mailPreferences.twoFactorEnabled ? (
              <button
                type="button"
                onClick={() => setDisablingOpen((v) => !v)}
                className="text-sm font-medium text-destructive hover:underline"
              >
                {t("settings.disable")}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartTwoFactorSetup}
                disabled={settingUpTwoFactor}
                className="text-sm font-medium text-primary hover:underline"
              >
                {settingUpTwoFactor ? t("settings.twoFactorSettingUp") : t("settings.enable")}
              </button>
            )}
          </div>

          {twoFactorSetup && (
            <div className="mt-4 flex flex-col gap-4 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
              <div className="flex flex-col items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={twoFactorSetup.qrDataUrl}
                  alt={t("settings.twoFactorQrAlt")}
                  className="size-40 rounded-lg border border-slate-200 dark:border-slate-800"
                />
                <p className="text-center text-xs text-muted-foreground">
                  {t("settings.twoFactorScanHint")}
                </p>
                <code className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-1 text-xs break-all">
                  {twoFactorSetup.secret}
                </code>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  {t("settings.twoFactorBackupCodesLabel")}
                </p>
                <div className="mt-1.5 grid grid-cols-2 gap-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 p-3 font-mono text-xs">
                  {twoFactorSetup.backupCodes.map((code) => (
                    <span key={code}>{code}</span>
                  ))}
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {t("settings.twoFactorBackupCodesHint")}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Input
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  placeholder={t("settings.twoFactorCodePlaceholder")}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className={cn("self-start", premiumButton)}
                    onClick={handleConfirmTwoFactor}
                    disabled={confirmingTwoFactor || !twoFactorCode}
                  >
                    {confirmingTwoFactor ? t("saving") : t("settings.twoFactorConfirm")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setTwoFactorSetup(null);
                      setTwoFactorCode("");
                    }}
                  >
                    {t("cancel")}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {disablingOpen && (
            <div className="mt-4 flex flex-col gap-3 pl-7">
              <Input
                type="password"
                value={disableCurrentPassword}
                onChange={(e) => setDisableCurrentPassword(e.target.value)}
                placeholder={t("settings.currentPassword")}
              />
              <Input
                value={disableCode}
                onChange={(e) => setDisableCode(e.target.value)}
                placeholder={t("settings.twoFactorCodePlaceholder")}
              />
              <Button
                size="sm"
                variant="outline"
                className="self-start border-destructive/40 text-destructive hover:bg-destructive/10"
                onClick={handleDisableTwoFactor}
                disabled={disablingTwoFactor || !disableCurrentPassword || !disableCode}
              >
                {disablingTwoFactor ? t("saving") : t("settings.twoFactorDisableConfirm")}
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 py-4">
          <span className="flex items-center gap-3">
            <Mail className="size-4 text-slate-400 dark:text-slate-500" strokeWidth={1.5} />
            <span className="flex flex-col">
              <span className="text-sm font-medium text-slate-900 dark:text-slate-50">
                {t("settings.recoveryEmail")}
              </span>
              <span className="text-xs text-muted-foreground">
                {t("settings.recoveryEmailNotSet")}
              </span>
            </span>
          </span>
          <button
            type="button"
            onClick={() => show(t("settings.recoveryEmailComingSoon"), "info")}
            className="text-sm font-medium text-primary hover:underline"
          >
            {t("settings.addRecoveryEmail")}
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 pt-4">
          <span className="flex items-center gap-3">
            <Smartphone className="size-4 text-slate-400 dark:text-slate-500" strokeWidth={1.5} />
            <span className="flex flex-col">
              <span className="text-sm font-medium text-slate-900 dark:text-slate-50">
                {t("settings.activeSessions")}
              </span>
              <span className="text-xs text-muted-foreground">
                {t("settings.activeSessionsCurrent")}
              </span>
            </span>
          </span>
          <button
            type="button"
            onClick={() => show(t("settings.sessionsComingSoon"), "info")}
            className="text-sm font-medium text-primary hover:underline"
          >
            {t("settings.viewAllSessions")}
          </button>
        </div>
      </div>
    </SettingsModal>
  );
}

function ForwardingModal({
  account,
  onClose,
  onSave,
}: {
  account: OnboardingAccount;
  onClose: () => void;
  onSave: (payload: {
    forwardingEmail: string;
    forwardingVerified: boolean;
    keepForwardedCopy: boolean;
  }) => Promise<boolean>;
}) {
  const t = useTranslations("Dashboard.mailPage");
  const { show } = useToast();
  const [forwardingEmailInput, setForwardingEmailInput] = useState(
    account.mailPreferences.forwardingEmail,
  );
  const [sendingVerification, setSendingVerification] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [keepCopy, setKeepCopy] = useState(account.mailPreferences.keepForwardedCopy);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const verified = account.mailPreferences.forwardingVerified;

  async function handleSendVerification() {
    if (!forwardingEmailInput.trim()) return;
    setSendingVerification(true);
    const ok = await setForwardingEmail({ forwardingEmail: forwardingEmailInput });
    setSendingVerification(false);
    if (!ok) {
      show(t("settings.forwardingSendError"), "error");
      return;
    }
    setVerificationSent(true);
    show(t("settings.verifyEmailSent", { email: forwardingEmailInput }), "info");
  }

  async function handleSave() {
    setSavingPreferences(true);
    const ok = await onSave({
      forwardingEmail: forwardingEmailInput,
      forwardingVerified: verified,
      keepForwardedCopy: keepCopy,
    });
    setSavingPreferences(false);
    if (!ok) {
      show(t("settings.forwardingSaveError"), "error");
      return;
    }
    show(t("settings.forwardingSaved"), "success");
    onClose();
  }

  return (
    <SettingsModal
      title={t("settings.forwardingTitle")}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button className={cn(premiumButton)} disabled={savingPreferences} onClick={handleSave}>
            {savingPreferences ? t("saving") : t("save")}
          </Button>
        </>
      }
    >
      <p className="text-sm text-muted-foreground">{t("settings.forwardingDescription")}</p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="text-xs font-medium text-muted-foreground">
            {t("settings.forwardingEmailLabel")}
          </label>
          <Input
            value={forwardingEmailInput}
            onChange={(e) => {
              setForwardingEmailInput(e.target.value);
              setVerificationSent(false);
            }}
            placeholder={t("settings.forwardingEmailPlaceholder")}
            className="mt-1.5"
          />
        </div>
        <Button
          variant="outline"
          onClick={handleSendVerification}
          disabled={sendingVerification || !forwardingEmailInput.trim()}
        >
          {sendingVerification ? t("saving") : t("settings.verifyEmail")}
        </Button>
      </div>

      {verified ? (
        <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-600">
          <ShieldCheck className="size-3.5" strokeWidth={1.5} />
          {t("settings.forwardingVerified")}
        </p>
      ) : verificationSent ? (
        <p className="mt-2 text-xs text-muted-foreground">{t("settings.forwardingCheckInbox")}</p>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground">
          {t("settings.forwardingVerifyRequired")}
        </p>
      )}

      <label className="mt-4 flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={keepCopy}
          onChange={(e) => setKeepCopy(e.target.checked)}
          className="size-4 rounded accent-primary"
        />
        {t("settings.keepCopyLabel")}
      </label>
    </SettingsModal>
  );
}

function SignatureField({
  icon: Icon,
  label,
  value,
  onChange,
  placeholder,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="relative mt-1.5">
        <Icon
          className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400 dark:text-slate-500"
          strokeWidth={1.5}
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 pr-3.5 pl-9 text-sm text-slate-900 dark:text-slate-50 outline-none transition-all duration-200 placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
    </div>
  );
}

function SignatureModal({
  account,
  displayName,
  onClose,
  onSave,
}: {
  account: OnboardingAccount;
  displayName: string;
  onClose: () => void;
  onSave: (payload: SignatureSettings) => Promise<boolean>;
}) {
  const t = useTranslations("Dashboard.mailPage");
  const { show } = useToast();
  const s = account.mailPreferences.signature;
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(s.name || displayName || account.ownerName);
  const [jobTitle, setJobTitle] = useState(s.jobTitle || account.mailPreferences.jobTitle);
  const [includePhoto, setIncludePhoto] = useState(s.includePhoto);
  const [phone, setPhone] = useState(s.phone);
  const [website, setWebsite] = useState(s.website);
  const [address, setAddress] = useState(s.address);
  const [linkedin, setLinkedin] = useState(s.linkedin);
  const [facebook, setFacebook] = useState(s.facebook);
  const [instagram, setInstagram] = useState(s.instagram);
  const [includeInNewEmails, setIncludeInNewEmails] = useState(s.includeInNewEmails);
  const [includeInReplies, setIncludeInReplies] = useState(s.includeInReplies);

  const previewSettings: SignatureSettings = {
    name,
    jobTitle,
    includePhoto,
    phone,
    website,
    address,
    linkedin,
    facebook,
    instagram,
    includeInNewEmails,
    includeInReplies,
  };
  const socialIcons = [
    linkedin && { Icon: Linkedin, handle: linkedin },
    facebook && { Icon: Facebook, handle: facebook },
    instagram && { Icon: Instagram, handle: instagram },
  ].filter((item): item is { Icon: LucideIcon; handle: string } => Boolean(item));
  const hasPreviewContent = Boolean(
    name || jobTitle || phone || website || address || socialIcons.length > 0,
  );
  const avatarDataUrl = account.mailPreferences.avatarDataUrl;

  async function handleSave() {
    setSaving(true);
    const ok = await onSave(previewSettings);
    setSaving(false);
    if (ok) {
      show(t("settings.signatureSaved"), "success");
      onClose();
    } else {
      show(t("settings.signatureSaveError"), "error");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        aria-hidden
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl shadow-slate-300/60 dark:shadow-black/40"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">{t("settings.signatureTitle")}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("cancel")}
            className="flex size-7 items-center justify-center rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300"
          >
            <X className="size-4" strokeWidth={1.5} />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 overflow-y-auto px-6 py-6 md:grid-cols-2">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  {t("displayName")}
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-50 outline-none transition-all duration-200 placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  {t("settings.jobTitle")}
                </label>
                <input
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-50 outline-none transition-all duration-200 placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={includePhoto}
                onChange={(e) => setIncludePhoto(e.target.checked)}
                className="size-4 rounded accent-primary"
              />
              {t("settings.includePhoto")}
            </label>

            <div className="flex flex-col gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
              <SignatureField
                icon={Phone}
                label={t("settings.phone")}
                value={phone}
                onChange={setPhone}
                placeholder={t("settings.phonePlaceholder")}
              />
              <SignatureField
                icon={Globe}
                label={t("settings.website")}
                value={website}
                onChange={setWebsite}
                placeholder={t("settings.websitePlaceholder")}
              />
              <SignatureField
                icon={MapPin}
                label={t("settings.businessAddress")}
                value={address}
                onChange={setAddress}
                placeholder={t("settings.businessAddressPlaceholder")}
              />
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
              <SignatureField
                icon={Linkedin}
                label="LinkedIn"
                value={linkedin}
                onChange={setLinkedin}
                placeholder="linkedin.com/in/…"
              />
              <SignatureField
                icon={Facebook}
                label="Facebook"
                value={facebook}
                onChange={setFacebook}
                placeholder="facebook.com/…"
              />
              <SignatureField
                icon={Instagram}
                label="Instagram"
                value={instagram}
                onChange={setInstagram}
                placeholder="@handle"
              />
            </div>
          </div>

          <div className="md:sticky md:top-6">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {t("settings.signaturePreview")}
            </p>
            <div className="mt-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 p-5 transition-shadow duration-300 hover:shadow-md">
              {!hasPreviewContent ? (
                <p className="text-sm text-muted-foreground">
                  {t("settings.signaturePreviewEmpty")}
                </p>
              ) : (
                <div className="flex items-start gap-3">
                  {includePhoto &&
                    (avatarDataUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={avatarDataUrl}
                        alt=""
                        className="size-11 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                        {(name || "?").charAt(0).toUpperCase()}
                      </span>
                    ))}
                  <div className="flex min-w-0 flex-col gap-1">
                    {name && (
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">{name}</p>
                    )}
                    {jobTitle && (
                      <p className="flex items-center gap-1.5 truncate text-sm text-slate-600 dark:text-slate-400">
                        <Briefcase
                          className="size-3.5 shrink-0 text-slate-400 dark:text-slate-500"
                          strokeWidth={1.5}
                        />
                        <span className="truncate">{jobTitle}</span>
                      </p>
                    )}
                    {phone && (
                      <p className="flex items-center gap-1.5 truncate text-sm text-slate-600 dark:text-slate-400">
                        <Phone className="size-3.5 shrink-0 text-slate-400 dark:text-slate-500" strokeWidth={1.5} />
                        <span className="truncate">{phone}</span>
                      </p>
                    )}
                    {website && (
                      <p className="flex items-center gap-1.5 truncate text-sm text-slate-600 dark:text-slate-400">
                        <Globe className="size-3.5 shrink-0 text-slate-400 dark:text-slate-500" strokeWidth={1.5} />
                        <span className="truncate">{website}</span>
                      </p>
                    )}
                    {address && (
                      <p className="flex items-center gap-1.5 truncate text-sm text-slate-600 dark:text-slate-400">
                        <MapPin className="size-3.5 shrink-0 text-slate-400 dark:text-slate-500" strokeWidth={1.5} />
                        <span className="truncate">{address}</span>
                      </p>
                    )}
                    {socialIcons.length > 0 && (
                      <div className="mt-0.5 flex items-center gap-3">
                        {socialIcons.map(({ Icon, handle }, i) => (
                          <span
                            key={i}
                            title={handle}
                            className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400"
                          >
                            <Icon className="size-3.5 shrink-0 text-slate-500 dark:text-slate-400" strokeWidth={1.5} />
                            <span className="max-w-[110px] truncate">{handle}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-3 border-t border-slate-100 dark:border-slate-800 px-6 py-4">
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={includeInNewEmails}
              onChange={(e) => setIncludeInNewEmails(e.target.checked)}
              className="size-4 rounded accent-primary"
            />
            {t("settings.includeInNewEmails")}
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={includeInReplies}
              onChange={(e) => setIncludeInReplies(e.target.checked)}
              className="size-4 rounded accent-primary"
            />
            {t("settings.includeInReplies")}
          </label>
          <div className="flex items-center justify-end gap-2 pt-1">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              {t("cancel")}
            </Button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary-dark active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {t("save")}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

interface ImportProvider {
  id: "gmail" | "outlook" | "yahoo" | "icloud" | "imap";
  labelKey: string;
  sublabelKey: string;
  initials: string;
  badgeClass: string;
}

const IMPORT_PROVIDERS: ImportProvider[] = [
  {
    id: "gmail",
    labelKey: "import.gmailLabel",
    sublabelKey: "import.gmailSublabel",
    initials: "G",
    badgeClass: "bg-red-500",
  },
  {
    id: "outlook",
    labelKey: "import.outlookLabel",
    sublabelKey: "import.outlookSublabel",
    initials: "O",
    badgeClass: "bg-blue-600",
  },
  {
    id: "yahoo",
    labelKey: "import.yahooLabel",
    sublabelKey: "import.yahooSublabel",
    initials: "Y",
    badgeClass: "bg-violet-600",
  },
  {
    id: "icloud",
    labelKey: "import.icloudLabel",
    sublabelKey: "import.icloudSublabel",
    initials: "iC",
    badgeClass: "bg-slate-500",
  },
  {
    id: "imap",
    labelKey: "import.imapLabel",
    sublabelKey: "import.imapSublabel",
    initials: "",
    badgeClass: "bg-slate-400",
  },
];

const IMPORT_FIELD_CLASS =
  "mt-1.5 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-50 outline-none transition-all duration-200 placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20";

function ImportProviderBadge({ provider, large }: { provider: ImportProvider; large?: boolean }) {
  const dimension = large ? "size-11" : "size-9";
  if (provider.id === "imap") {
    return (
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400",
          dimension,
        )}
      >
        <Server className={large ? "size-5" : "size-4"} strokeWidth={1.5} />
      </span>
    );
  }
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl font-semibold text-white",
        large ? "text-base" : "text-sm",
        provider.badgeClass,
        dimension,
      )}
    >
      {provider.initials}
    </span>
  );
}

const IMPORT_TOTAL_MESSAGES = 128;

function ImportMailModal({
  onClose,
  onComplete,
}: {
  onClose: () => void;
  onComplete: (provider: string) => void;
}) {
  const t = useTranslations("Dashboard.mailPage");
  const [step, setStep] = useState<"select" | "connect" | "options" | "importing" | "success">(
    "select",
  );
  const [providerId, setProviderId] = useState<ImportProvider["id"] | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [imapHost, setImapHost] = useState("");
  const [imapPort, setImapPort] = useState("993");
  const [scopeInbox, setScopeInbox] = useState(true);
  const [scopeSent, setScopeSent] = useState(true);
  const [scopeAll, setScopeAll] = useState(false);
  const [dateRange, setDateRange] = useState<"all" | "year" | "month">("all");
  const [progress, setProgress] = useState(0);

  const provider = IMPORT_PROVIDERS.find((p) => p.id === providerId) ?? null;
  const providerLabel = provider ? t(provider.labelKey) : "";

  useEffect(() => {
    if (step !== "importing") return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(IMPORT_TOTAL_MESSAGES, prev + Math.round(IMPORT_TOTAL_MESSAGES / 12));
        if (next >= IMPORT_TOTAL_MESSAGES) {
          clearInterval(interval);
          setTimeout(() => setStep("success"), 400);
        }
        return next;
      });
    }, 220);
    return () => clearInterval(interval);
  }, [step]);

  function handleSelectProvider(id: ImportProvider["id"]) {
    setProviderId(id);
    setStep("connect");
  }

  function handleStartImport() {
    setProgress(0);
    setStep("importing");
  }

  const canContinueFromConnect =
    provider?.id === "imap" ? Boolean(imapHost.trim() && email.trim()) : Boolean(email.trim());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        aria-hidden
        onClick={step === "importing" ? undefined : onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="relative flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl shadow-slate-300/60 dark:shadow-black/40"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            {t("import.modalTitle")}
          </h2>
          {step !== "importing" && (
            <button
              type="button"
              onClick={onClose}
              aria-label={t("cancel")}
              className="flex size-7 items-center justify-center rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300"
            >
              <X className="size-4" strokeWidth={1.5} />
            </button>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {step === "select" && (
            <div className="flex flex-col gap-4 p-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                  {t("import.selectTitle")}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{t("import.selectDescription")}</p>
              </div>
              <div className="flex flex-col gap-2.5">
                {IMPORT_PROVIDERS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectProvider(p.id)}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 text-left transition-all duration-200 hover:border-primary/30 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <ImportProviderBadge provider={p} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                        {t(p.labelKey)}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{t(p.sublabelKey)}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === "connect" && provider && (
            <div className="flex flex-col gap-4 p-6">
              <div className="flex items-center gap-3">
                <ImportProviderBadge provider={provider} large />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                  {t("import.connectTitle", { provider: providerLabel })}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground">{t("import.connectDescription")}</p>

              {provider.id === "imap" && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    {t("import.imapHost")}
                  </label>
                  <input
                    value={imapHost}
                    onChange={(e) => setImapHost(e.target.value)}
                    placeholder={t("import.imapHostPlaceholder")}
                    className={IMPORT_FIELD_CLASS}
                  />
                </div>
              )}
              <div className={cn(provider.id === "imap" && "grid grid-cols-2 gap-3")}>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    {t("import.emailAddress")}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("import.emailAddressPlaceholder")}
                    className={IMPORT_FIELD_CLASS}
                  />
                </div>
                {provider.id === "imap" && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">
                      {t("import.imapPort")}
                    </label>
                    <input
                      value={imapPort}
                      onChange={(e) => setImapPort(e.target.value)}
                      className={IMPORT_FIELD_CLASS}
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  {t("import.password")}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("import.passwordPlaceholder")}
                  className={IMPORT_FIELD_CLASS}
                />
              </div>

              <div className="mt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep("select")}
                  className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50"
                >
                  {t("import.back")}
                </button>
                <button
                  type="button"
                  disabled={!canContinueFromConnect}
                  onClick={() => setStep("options")}
                  className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary-dark active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {t("import.continue")}
                </button>
              </div>
            </div>
          )}

          {step === "options" && (
            <div className="flex flex-col gap-4 p-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                  {t("import.optionsTitle")}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("import.optionsDescription")}
                </p>
              </div>
              <div className="flex flex-col gap-2.5 border-t border-slate-100 dark:border-slate-800 pt-4">
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={scopeInbox}
                    onChange={(e) => setScopeInbox(e.target.checked)}
                    className="size-4 rounded accent-primary"
                  />
                  {t("import.scopeInbox")}
                </label>
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={scopeSent}
                    onChange={(e) => setScopeSent(e.target.checked)}
                    className="size-4 rounded accent-primary"
                  />
                  {t("import.scopeSent")}
                </label>
                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={scopeAll}
                    onChange={(e) => setScopeAll(e.target.checked)}
                    className="size-4 rounded accent-primary"
                  />
                  {t("import.scopeAll")}
                </label>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  {t("import.dateRangeLabel")}
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
                  className={IMPORT_FIELD_CLASS}
                >
                  <option value="all">{t("import.dateRangeAll")}</option>
                  <option value="year">{t("import.dateRangeYear")}</option>
                  <option value="month">{t("import.dateRangeMonth")}</option>
                </select>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep("connect")}
                  className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50"
                >
                  {t("import.back")}
                </button>
                <button
                  type="button"
                  onClick={handleStartImport}
                  className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary-dark active:scale-95"
                >
                  {t("import.startImport")}
                </button>
              </div>
            </div>
          )}

          {step === "importing" && (
            <div className="flex flex-col items-center gap-4 p-10 text-center">
              <Loader2 className="size-8 animate-spin text-primary" strokeWidth={1.5} />
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
                {t("import.importingTitle", { provider: providerLabel })}
              </h3>
              <p className="max-w-sm text-sm text-muted-foreground">
                {t("import.importingDescription")}
              </p>
              <div className="mt-2 w-full max-w-xs">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
                    style={{ width: `${(progress / IMPORT_TOTAL_MESSAGES) * 100}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {t("import.importingCount", { count: progress, total: IMPORT_TOTAL_MESSAGES })}
                </p>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="flex flex-col items-center gap-3 p-10 text-center">
              <div className="relative">
                <div
                  aria-hidden
                  className="absolute -inset-6 -z-10 rounded-full bg-secondary/20 blur-2xl"
                />
                <span className="flex size-14 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                  <Check className="size-7" strokeWidth={2} />
                </span>
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
                {t("import.successTitle")}
              </h3>
              <p className="max-w-sm text-sm text-muted-foreground">
                {t("import.successDescription", {
                  count: IMPORT_TOTAL_MESSAGES,
                  provider: providerLabel,
                })}
              </p>
              <button
                type="button"
                onClick={() => onComplete(providerLabel)}
                className="mt-4 w-full max-w-xs rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary-dark active:scale-95"
              >
                {t("import.goToInbox")}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function MailSettingsView({
  account,
  displayName,
  onSaveProfile,
  onTwoFactorChanged,
  onSaveForwarding,
  onSaveSignature,
  onImportComplete,
  initialModal,
}: {
  account: OnboardingAccount;
  displayName: string;
  onSaveProfile: (payload: {
    ownerName: string;
    jobTitle: string;
    avatarDataUrl: string | null;
  }) => Promise<boolean>;
  onTwoFactorChanged: (enabled: boolean) => void;
  onSaveForwarding: (payload: {
    forwardingEmail: string;
    forwardingVerified: boolean;
    keepForwardedCopy: boolean;
  }) => Promise<boolean>;
  onSaveSignature: (payload: SignatureSettings) => Promise<boolean>;
  onImportComplete: (provider: string) => void;
  initialModal?: "profile" | "security" | "forwarding" | "signature" | "import" | null;
}) {
  const t = useTranslations("Dashboard.mailPage");
  const [activeModal, setActiveModal] = useState<
    "profile" | "security" | "forwarding" | "signature" | "import" | null
  >(initialModal ?? null);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 pt-4">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">{t("settingsNav")}</h2>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{t("settings.pageSubtitle")}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SettingsCard
          icon={UserRound}
          iconWashClassName="bg-primary/10 text-primary"
          title={t("settings.profileTitle")}
          description={t("settings.profileDescription")}
          onClick={() => setActiveModal("profile")}
        />
        <SettingsCard
          icon={ShieldCheck}
          iconWashClassName="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          title={t("settings.securityTitle")}
          description={t("settings.securityDescription")}
          onClick={() => setActiveModal("security")}
        />
        <SettingsCard
          icon={Forward}
          iconWashClassName="bg-secondary/10 text-secondary"
          title={t("settings.forwardingTitle")}
          description={t("settings.forwardingDescription")}
          onClick={() => setActiveModal("forwarding")}
        />
        <SettingsCard
          icon={Signature}
          iconWashClassName="bg-accent text-accent-foreground"
          title={t("settings.signatureTitle")}
          description={t("settings.signatureDescription")}
          onClick={() => setActiveModal("signature")}
        />
        <SettingsCard
          icon={Download}
          iconWashClassName="bg-primary/10 text-primary"
          title={t("settings.importTitle")}
          description={t("settings.importDescription")}
          onClick={() => setActiveModal("import")}
        />
      </div>

      {activeModal === "profile" && (
        <ProfileModal
          account={account}
          displayName={displayName}
          onClose={() => setActiveModal(null)}
          onSave={onSaveProfile}
        />
      )}
      {activeModal === "security" && (
        <SecurityModal
          account={account}
          onClose={() => setActiveModal(null)}
          onTwoFactorChanged={onTwoFactorChanged}
        />
      )}
      {activeModal === "forwarding" && (
        <ForwardingModal
          account={account}
          onClose={() => setActiveModal(null)}
          onSave={onSaveForwarding}
        />
      )}
      {activeModal === "signature" && (
        <SignatureModal
          account={account}
          displayName={displayName}
          onClose={() => setActiveModal(null)}
          onSave={onSaveSignature}
        />
      )}
      {activeModal === "import" && (
        <ImportMailModal
          onClose={() => setActiveModal(null)}
          onComplete={(provider) => {
            setActiveModal(null);
            onImportComplete(provider);
          }}
        />
      )}
    </div>
  );
}

const VOICE_CARD_COLORS = ["#FBB02D", "#FB6107", "#5C8001", "#7c3aed", "#0891b2"];
const VOICE_WAVEFORM_BAR_COUNT = 28;

function VoiceMessageCard({
  audioDataUrl,
  durationSec,
  recorderName,
  recorderAvatarDataUrl,
  cardColor,
  onRemove,
}: {
  audioDataUrl?: string;
  durationSec?: number;
  recorderName: string;
  recorderAvatarDataUrl: string | null;
  cardColor?: string;
  onRemove?: () => void;
}) {
  const t = useTranslations("Dashboard.mailPage");
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [hasPlayed, setHasPlayed] = useState(false);
  const color = cardColor ?? "#FBB02D";
  const totalSeconds = durationSec ?? 0;

  const bars = useMemo(
    () =>
      Array.from({ length: VOICE_WAVEFORM_BAR_COUNT }, (_, i) => 25 + ((i * 37) % 65)),
    [],
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onPlay = () => {
      setIsPlaying(true);
      setHasPlayed(true);
    };
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  }

  const displaySeconds = currentTime > 0 ? currentTime : totalSeconds;
  const progress = totalSeconds > 0 ? Math.min(1, currentTime / totalSeconds) : 0;

  return (
    <div className="flex w-full max-w-xs items-center gap-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-sm">
      <span
        className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg"
        style={{ backgroundColor: color }}
      >
        {recorderAvatarDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={recorderAvatarDataUrl} alt="" className="size-full object-cover" />
        ) : (
          <span className="text-sm font-semibold text-white">
            {(recorderName || "?").charAt(0).toUpperCase()}
          </span>
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-slate-700 dark:text-slate-300">
          {recorderName}
        </p>
        {!hasPlayed && (
          <p className="truncate text-[10px] font-medium" style={{ color }}>
            {t("playVoiceNoteLabel")}
          </p>
        )}
        <div className="mt-1 flex items-center gap-2">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? t("pauseVoiceMessage") : t("playVoiceMessage")}
            style={{ backgroundColor: color }}
            className="flex size-7 shrink-0 items-center justify-center rounded-full text-white transition-transform hover:scale-105"
          >
            {isPlaying ? (
              <Pause className="size-3.5 fill-current" strokeWidth={1.5} />
            ) : (
              <Play className="ml-0.5 size-3.5 fill-current" strokeWidth={1.5} />
            )}
          </button>
          <div className="flex h-6 min-w-0 flex-1 items-center gap-[2px] overflow-hidden">
            {bars.map((height, i) => {
              const active = i / bars.length <= progress;
              return (
                <span
                  key={i}
                  className={cn(
                    "w-[2px] shrink-0 rounded-full",
                    !active && "bg-slate-200 dark:bg-slate-700",
                  )}
                  style={{ height: `${height}%`, backgroundColor: active ? color : undefined }}
                />
              );
            })}
          </div>
          <span className="shrink-0 font-mono text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
            {formatDuration(Math.round(displaySeconds))}
          </span>
        </div>
      </div>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={t("delete")}
          className="flex size-6 shrink-0 items-center justify-center rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-destructive"
        >
          <X className="size-3.5" strokeWidth={1.5} />
        </button>
      )}
      {audioDataUrl && <audio ref={audioRef} src={audioDataUrl} className="hidden" />}
    </div>
  );
}

function VoiceRecorderPanel({
  recorderName,
  recorderAvatarDataUrl,
  onClose,
  onAttach,
}: {
  recorderName: string;
  recorderAvatarDataUrl: string | null;
  onClose: () => void;
  onAttach: (attachment: EmailAttachment) => void;
}) {
  const t = useTranslations("Dashboard.mailPage");
  const { show } = useToast();
  const [entered, setEntered] = useState(false);
  const [cardColor, setCardColor] = useState(VOICE_CARD_COLORS[0]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioDataUrl, setAudioDataUrl] = useState<string | null>(null);
  const [durationSec, setDurationSec] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioBlobRef = useRef<Blob | null>(null);
  const recordingSecondsRef = useRef(0);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cancelledRecordingRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const visualizerFrameRef = useRef<number | null>(null);
  const barRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (visualizerFrameRef.current) cancelAnimationFrame(visualizerFrameRef.current);
      mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());
      audioContextRef.current?.close();
    };
  }, []);

  function startVisualizer(stream: MediaStream) {
    const audioContext = new AudioContext();
    if (audioContext.state === "suspended") {
      audioContext.resume();
    }
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 64;
    analyser.smoothingTimeConstant = 0.6;
    source.connect(analyser);
    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    const data = new Uint8Array(analyser.frequencyBinCount);
    const step = Math.max(1, Math.floor(data.length / VOICE_WAVEFORM_BAR_COUNT));

    function tick() {
      if (!analyserRef.current) return;
      analyserRef.current.getByteFrequencyData(data);
      for (let i = 0; i < VOICE_WAVEFORM_BAR_COUNT; i++) {
        const value = data[i * step] ?? 0;
        const heightPct = Math.max(12, Math.min(100, (value / 255) * 100));
        const bar = barRefs.current[i];
        if (bar) bar.style.height = `${heightPct}%`;
      }
      visualizerFrameRef.current = requestAnimationFrame(tick);
    }
    tick();
  }

  function stopVisualizer() {
    if (visualizerFrameRef.current) {
      cancelAnimationFrame(visualizerFrameRef.current);
      visualizerFrameRef.current = null;
    }
    analyserRef.current = null;
    audioContextRef.current?.close();
    audioContextRef.current = null;
  }

  async function handleStartRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      cancelledRecordingRef.current = false;
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        stopVisualizer();
        if (cancelledRecordingRef.current) return;
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        audioBlobRef.current = blob;
        const reader = new FileReader();
        reader.onload = () => {
          setAudioDataUrl(reader.result as string);
          setDurationSec(recordingSecondsRef.current);
        };
        reader.readAsDataURL(blob);
      };

      recorder.start();
      recordingSecondsRef.current = 0;
      setRecordingSeconds(0);
      setAudioDataUrl(null);
      setIsRecording(true);
      startVisualizer(stream);
      recordingTimerRef.current = setInterval(() => {
        recordingSecondsRef.current += 1;
        setRecordingSeconds(recordingSecondsRef.current);
        if (recordingSecondsRef.current >= 300) handleStopRecording();
      }, 1000);
    } catch {
      show(t("micPermissionDenied"), "error");
    }
  }

  function handleStopRecording() {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  }

  function handleCancelRecording() {
    cancelledRecordingRef.current = true;
    handleStopRecording();
    setRecordingSeconds(0);
  }

  function handleReRecord() {
    setAudioDataUrl(null);
    setDurationSec(0);
  }

  async function handleAttach() {
    const blob = audioBlobRef.current;
    if (!audioDataUrl || !blob) return;
    const name = t("voiceMessageName", { duration: formatDuration(durationSec) });

    const data = new Uint8Array(await blob.arrayBuffer());
    const [uploaded] = await uploadFiles([
      { name: `${name}.webm`, type: blob.type, size: blob.size, data },
    ]);
    if (!uploaded) {
      show(t("attachmentUploadFailed"), "error");
      return;
    }

    onAttach({
      name,
      sizeKb: Math.max(1, Math.round(blob.size / 1024)),
      type: "voice",
      audioDataUrl,
      durationSec,
      cardColor,
      fileId: uploaded.id,
    });
  }

  const cardWash = `color-mix(in oklab, ${cardColor} 14%, white)`;

  return (
    <div className="fixed inset-0 z-50">
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-black/30 transition-opacity duration-300",
          entered ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        className={cn(
          "absolute top-0 right-0 flex h-full w-full max-w-sm flex-col bg-white dark:bg-slate-900 shadow-2xl transition-transform duration-300 ease-out",
          entered ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {t("recordVoiceMessage")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("cancel")}
            className="flex size-7 items-center justify-center rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300"
          >
            <X className="size-4" strokeWidth={1.5} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          <div
            className="rounded-2xl border border-slate-100 dark:border-slate-800 p-6 text-center transition-colors duration-300"
            style={{ backgroundColor: cardWash }}
          >
            <span
              className="mx-auto flex size-16 items-center justify-center overflow-hidden rounded-xl border-2 border-white shadow-sm"
              style={{ backgroundColor: cardColor }}
            >
              {recorderAvatarDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={recorderAvatarDataUrl} alt="" className="size-full object-cover" />
              ) : (
                <span className="text-lg font-semibold text-white">
                  {(recorderName || "?").charAt(0).toUpperCase()}
                </span>
              )}
            </span>
            <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-slate-50">
              {recorderName}
            </p>

            <div className="mt-6 flex flex-col items-center gap-3">
              {isRecording ? (
                <>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      title={t("cancelRecording")}
                      onClick={handleCancelRecording}
                      className="flex size-9 items-center justify-center rounded-full text-slate-500 dark:text-slate-400 transition-colors hover:bg-white/60 dark:hover:bg-black/20"
                    >
                      <X className="size-4" strokeWidth={1.5} />
                    </button>
                    <button
                      type="button"
                      title={t("stopRecording")}
                      onClick={handleStopRecording}
                      style={{ backgroundColor: cardColor }}
                      className="flex size-16 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105"
                    >
                      <Square className="size-6 fill-current" strokeWidth={1.5} />
                    </button>
                    <span className="size-9 shrink-0" aria-hidden />
                  </div>
                  <div className="flex h-10 w-full items-end justify-center gap-[3px] px-2">
                    {Array.from({ length: VOICE_WAVEFORM_BAR_COUNT }).map((_, i) => (
                      <span
                        key={i}
                        ref={(el) => {
                          barRefs.current[i] = el;
                        }}
                        className="w-[3px] shrink-0 rounded-full transition-[height] duration-75 ease-out"
                        style={{ height: "12%", backgroundColor: cardColor }}
                      />
                    ))}
                  </div>
                  <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                    <span className="relative flex size-2">
                      <span className="absolute inline-flex size-full animate-ping rounded-full bg-destructive opacity-75" />
                      <span className="relative inline-flex size-2 rounded-full bg-destructive" />
                    </span>
                    <span className="font-mono">{formatDuration(recordingSeconds)}</span>
                  </span>
                </>
              ) : audioDataUrl ? (
                <>
                  <VoiceMessageCard
                    audioDataUrl={audioDataUrl}
                    durationSec={durationSec}
                    recorderName={recorderName}
                    recorderAvatarDataUrl={recorderAvatarDataUrl}
                    cardColor={cardColor}
                  />
                  <button
                    type="button"
                    onClick={handleReRecord}
                    className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100"
                  >
                    {t("reRecord")}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  title={t("recordVoiceMessage")}
                  onClick={handleStartRecording}
                  style={{ backgroundColor: cardColor }}
                  className="flex size-16 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105"
                >
                  <Mic className="size-6" strokeWidth={1.5} />
                </button>
              )}
            </div>
          </div>

          <div className="mt-5">
            <p className="text-xs font-medium text-muted-foreground">{t("cardColor")}</p>
            <div className="mt-2 flex items-center gap-2">
              {VOICE_CARD_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setCardColor(color)}
                  aria-label={color}
                  style={{ backgroundColor: color }}
                  className={cn(
                    "size-7 rounded-full transition-transform",
                    cardColor === color
                      ? "scale-110 ring-2 ring-slate-400 ring-offset-2 dark:ring-offset-slate-900"
                      : "hover:scale-105",
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-slate-100 dark:border-slate-800 p-6">
          <button
            type="button"
            disabled={!audioDataUrl}
            onClick={handleAttach}
            style={audioDataUrl ? { backgroundColor: cardColor } : undefined}
            className={cn(
              "w-full rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:brightness-95 active:scale-95",
              !audioDataUrl && "cursor-not-allowed bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-500",
            )}
          >
            {t("attachToMail")}
          </button>
        </div>
      </div>
    </div>
  );
}

interface ComposerPayload {
  bodyText: string;
  attachments: EmailAttachment[];
  confidential: boolean;
}

interface ComposerBodyHandle {
  getContent: () => ComposerPayload;
}

interface ComposerScheduleProps {
  enabled: boolean;
  date: string;
  onToggle: () => void;
  onDateChange: (value: string) => void;
}

const ComposerBody = forwardRef<
  ComposerBodyHandle,
  {
    signature: string;
    placeholder: string;
    footer?: ReactNode;
    grow?: boolean;
    schedule?: ComposerScheduleProps;
    autoInsertSignature?: boolean;
    onRequestCreateSignature?: () => void;
    composerDisplayName: string;
    composerAvatarDataUrl: string | null;
    voiceNotesEnabled: boolean;
  }
>(function ComposerBody(
  {
    signature,
    placeholder,
    footer,
    grow,
    schedule,
    autoInsertSignature,
    onRequestCreateSignature,
    composerDisplayName,
    composerAvatarDataUrl,
    voiceNotesEnabled,
  },
  ref,
) {
  const t = useTranslations("Dashboard.mailPage");
  const { show } = useToast();
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<EmailAttachment[]>([]);
  const [confidential, setConfidential] = useState(false);
  const [formattingOpen, setFormattingOpen] = useState(false);
  const [voicePanelOpen, setVoicePanelOpen] = useState(false);
  const savedRangeRef = useRef<Range | null>(null);

  useImperativeHandle(ref, () => ({
    getContent: () => ({
      bodyText: editorRef.current?.innerText.trim() ?? "",
      attachments,
      confidential,
    }),
  }));

  useEffect(() => {
    if (autoInsertSignature && signature.trim() && editorRef.current) {
      editorRef.current.innerHTML = `<br><br>${signature}`;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function exec(command: string, value?: string) {
    editorRef.current?.focus();
    const sel = window.getSelection();
    if (sel && savedRangeRef.current) {
      sel.removeAllRanges();
      sel.addRange(savedRangeRef.current);
    }
    document.execCommand(command, false, value);
  }

  function preserveSelection(e: React.MouseEvent) {
    e.preventDefault();
  }

  function saveSelection() {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.anchorNode)) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  }

  function handleLink() {
    const url = window.prompt(t("insertLinkPrompt"));
    if (!url) return;
    exec("createLink", url);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>, kind: "doc" | "image") {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    const type: EmailAttachment["type"] =
      kind === "image" ? "image" : file.name.toLowerCase().endsWith(".pdf") ? "pdf" : "doc";
    const placeholder: EmailAttachment = {
      name: file.name,
      sizeKb: Math.max(1, Math.round(file.size / 1024)),
      type,
    };
    setAttachments((prev) => [...prev, placeholder]);

    const data = new Uint8Array(await file.arrayBuffer());
    const [uploaded] = await uploadFiles([
      { name: file.name, type: file.type, size: file.size, data },
    ]);
    if (!uploaded) {
      setAttachments((prev) => prev.filter((a) => a !== placeholder));
      show(t("attachmentUploadFailed"), "error");
      return;
    }
    setAttachments((prev) =>
      prev.map((a) => (a === placeholder ? { ...a, fileId: uploaded.id } : a)),
    );
  }

  function removeAttachment(index: number) {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }

  function handleInsertSignature() {
    if (!signature.trim()) {
      onRequestCreateSignature?.();
      return;
    }
    exec("insertHTML", `<br><br>${signature}`);
  }

  const toolbarButtonClass =
    "flex size-8 items-center justify-center rounded-lg text-slate-800 dark:text-slate-100 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary";

  return (
    <>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        className={cn(
          "rich-text-editor bg-white dark:bg-slate-900 p-6 text-sm leading-relaxed text-slate-700 dark:text-slate-300 outline-none",
          grow ? "min-h-0 flex-1 overflow-y-auto" : "min-h-[180px]",
        )}
      />

      {confidential && (
        <div className="mx-6 mt-4 flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2 text-xs text-primary">
          <Lock className="size-3.5 shrink-0" strokeWidth={1.5} />
          {t("confidentialNotice")}
        </div>
      )}

      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 px-6 pt-4">
          {attachments.map((att, i) =>
            att.type === "voice" ? (
              <VoiceMessageCard
                key={i}
                audioDataUrl={att.audioDataUrl}
                durationSec={att.durationSec}
                recorderName={composerDisplayName}
                recorderAvatarDataUrl={composerAvatarDataUrl}
                cardColor={att.cardColor}
                onRemove={() => removeAttachment(i)}
              />
            ) : (
              <span
                key={i}
                className="flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-1 pr-1 pl-2 text-xs text-slate-700 dark:text-slate-300"
              >
                {(() => {
                  const AttIcon = ATTACHMENT_ICONS[att.type];
                  return (
                    <AttIcon
                      className="size-3.5 shrink-0 text-slate-500 dark:text-slate-400"
                      strokeWidth={1.5}
                    />
                  );
                })()}
                <span className="max-w-[140px] truncate">{att.name}</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(i)}
                  aria-label={t("delete")}
                  className="flex size-4 shrink-0 items-center justify-center rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-destructive"
                >
                  <X className="size-3" strokeWidth={1.5} />
                </button>
              </span>
            ),
          )}
        </div>
      )}

      {formattingOpen && (
        <div className="flex flex-wrap items-center gap-0.5 px-4 pt-3">
          <select
            title={t("fontFamily")}
            defaultValue=""
            onMouseDown={saveSelection}
            onChange={(e) => {
              if (!e.target.value) return;
              exec("fontName", e.target.value);
              e.target.value = "";
            }}
            className="h-8 rounded-lg border-none bg-transparent px-1.5 text-xs text-slate-600 dark:text-slate-400 outline-none hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <option value="" disabled>
              {t("fontFamily")}
            </option>
            {FONT_FAMILIES.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
          <select
            title={t("fontSize")}
            defaultValue=""
            onMouseDown={saveSelection}
            onChange={(e) => {
              if (!e.target.value) return;
              exec("fontSize", e.target.value);
              e.target.value = "";
            }}
            className="h-8 rounded-lg border-none bg-transparent px-1.5 text-xs text-slate-600 dark:text-slate-400 outline-none hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <option value="" disabled>
              {t("fontSize")}
            </option>
            {FONT_SIZES.map((s) => (
              <option key={s.value} value={s.value}>
                {t(s.labelKey)}
              </option>
            ))}
          </select>
          <span className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-700" />
          <button
            type="button"
            title={t("bold")}
            onMouseDown={preserveSelection}
            onClick={() => exec("bold")}
            className={toolbarButtonClass}
          >
            <Bold className="size-4" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            title={t("italic")}
            onMouseDown={preserveSelection}
            onClick={() => exec("italic")}
            className={toolbarButtonClass}
          >
            <Italic className="size-4" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            title={t("underline")}
            onMouseDown={preserveSelection}
            onClick={() => exec("underline")}
            className={toolbarButtonClass}
          >
            <Underline className="size-4" strokeWidth={1.5} />
          </button>
          <span className="relative">
            <button
              type="button"
              title={t("textColor")}
              onMouseDown={preserveSelection}
              className={toolbarButtonClass}
            >
              <Baseline className="size-4" strokeWidth={1.5} />
            </button>
            <input
              type="color"
              title={t("textColor")}
              defaultValue="#1e293b"
              onMouseDown={saveSelection}
              onChange={(e) => exec("foreColor", e.target.value)}
              className="absolute inset-0 size-8 cursor-pointer opacity-0"
            />
          </span>
          <span className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-700" />
          <button
            type="button"
            title={t("bulletList")}
            onMouseDown={preserveSelection}
            onClick={() => exec("insertUnorderedList")}
            className={toolbarButtonClass}
          >
            <List className="size-4" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            title={t("numberedList")}
            onMouseDown={preserveSelection}
            onClick={() => exec("insertOrderedList")}
            className={toolbarButtonClass}
          >
            <ListOrdered className="size-4" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            title={t("outdent")}
            onMouseDown={preserveSelection}
            onClick={() => exec("outdent")}
            className={toolbarButtonClass}
          >
            <IndentDecrease className="size-4" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            title={t("indent")}
            onMouseDown={preserveSelection}
            onClick={() => exec("indent")}
            className={toolbarButtonClass}
          >
            <IndentIncrease className="size-4" strokeWidth={1.5} />
          </button>
          <span className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-700" />
          <button
            type="button"
            title={t("alignLeft")}
            onMouseDown={preserveSelection}
            onClick={() => exec("justifyLeft")}
            className={toolbarButtonClass}
          >
            <AlignLeft className="size-4" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            title={t("alignCenter")}
            onMouseDown={preserveSelection}
            onClick={() => exec("justifyCenter")}
            className={toolbarButtonClass}
          >
            <AlignCenter className="size-4" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            title={t("alignRight")}
            onMouseDown={preserveSelection}
            onClick={() => exec("justifyRight")}
            className={toolbarButtonClass}
          >
            <AlignRight className="size-4" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            title={t("alignJustify")}
            onMouseDown={preserveSelection}
            onClick={() => exec("justifyFull")}
            className={toolbarButtonClass}
          >
            <AlignJustify className="size-4" strokeWidth={1.5} />
          </button>
        </div>
      )}

      {schedule?.enabled && (
        <div className="flex items-center gap-2 px-4 pt-3">
          <label className="text-xs font-medium text-muted-foreground">{t("sendAt")}</label>
          <input
            type="datetime-local"
            value={schedule.date}
            onChange={(e) => schedule.onDateChange(e.target.value)}
            className="h-9 flex-1 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring/20"
          />
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 p-4">
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            title={t("formattingOptions")}
            onClick={() => setFormattingOpen((v) => !v)}
            className={cn(toolbarButtonClass, formattingOpen && "bg-primary/10 text-primary")}
          >
            <Type className="size-4" strokeWidth={1.5} />
          </button>
          <span className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-700" />
          <button
            type="button"
            title={t("insertLink")}
            onMouseDown={preserveSelection}
            onClick={handleLink}
            className={toolbarButtonClass}
          >
            <Link2 className="size-4" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            title={t("addFile")}
            onClick={() => fileInputRef.current?.click()}
            className={toolbarButtonClass}
          >
            <Paperclip className="size-4" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            title={t("insertImage")}
            onClick={() => imageInputRef.current?.click()}
            className={toolbarButtonClass}
          >
            <ImageIcon className="size-4" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            title={voiceNotesEnabled ? t("recordVoiceMessage") : t("voiceNotesUpsellTitle")}
            onClick={() => {
              if (!voiceNotesEnabled) {
                show(t("voiceNotesUpsell"), "info");
                return;
              }
              setVoicePanelOpen(true);
            }}
            className="flex size-8 items-center justify-center rounded-lg text-[#FBB02D] transition-colors hover:bg-[#FBB02D]/10"
          >
            <Mic className="size-4" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            title={confidential ? t("confidentialOn") : t("confidentialMode")}
            onClick={() => setConfidential((v) => !v)}
            className={cn(toolbarButtonClass, confidential && "bg-primary/10 text-primary")}
          >
            <Lock className="size-4" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            title={signature.trim() ? t("insertSignature") : t("noSignatureSet")}
            onMouseDown={preserveSelection}
            onClick={handleInsertSignature}
            className={toolbarButtonClass}
          >
            <Signature className="size-4" strokeWidth={1.5} />
          </button>
          {schedule && (
            <button
              type="button"
              title={schedule.enabled ? t("scheduleSendOff") : t("scheduleSend")}
              onClick={schedule.onToggle}
              className={cn(toolbarButtonClass, schedule.enabled && "bg-primary/10 text-primary")}
            >
              <Clock className="size-4" strokeWidth={1.5} />
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => handleFileChange(e, "doc")}
          />
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileChange(e, "image")}
          />
        </div>
        <div className="flex items-center gap-3">
          {footer}
          <button
            type="button"
            title={t("aiAssistant")}
            onClick={() => show(t("aiComingSoon"), "info")}
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-ai-accent text-ai-accent-foreground shadow-sm shadow-ai-accent/30 transition-transform hover:scale-105"
          >
            <Sparkles className="size-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {voicePanelOpen && (
        <VoiceRecorderPanel
          recorderName={composerDisplayName}
          recorderAvatarDataUrl={composerAvatarDataUrl}
          onClose={() => setVoicePanelOpen(false)}
          onAttach={(attachment) => {
            setAttachments((prev) => [...prev, attachment]);
            setVoicePanelOpen(false);
          }}
        />
      )}
    </>
  );
});

function ReplyComposer({
  toEmail,
  signature,
  autoInsertSignature,
  onRequestCreateSignature,
  composerDisplayName,
  composerAvatarDataUrl,
  voiceNotesEnabled,
  onDiscard,
  onSend,
}: {
  toEmail: string;
  signature: string;
  autoInsertSignature?: boolean;
  onRequestCreateSignature?: () => void;
  composerDisplayName: string;
  composerAvatarDataUrl: string | null;
  voiceNotesEnabled: boolean;
  onDiscard: () => void;
  onSend: (payload: ComposerPayload) => void;
}) {
  const t = useTranslations("Dashboard.mailPage");
  const composerRef = useRef<ComposerBodyHandle>(null);
  const [expanded, setExpanded] = useState(false);

  function handleSend() {
    const payload = composerRef.current?.getContent();
    if (payload) onSend(payload);
  }

  const footer = (
    <Button size="sm" className={cn(premiumButton)} onClick={handleSend}>
      <Send className="size-3.5" strokeWidth={1.5} />
      {t("send")}
    </Button>
  );

  const header = (
    <div className="flex shrink-0 items-center justify-between px-6 pt-5">
      <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-400">
        {t("replyingTo", { email: toEmail })}
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? t("collapse") : t("expand")}
          title={expanded ? t("collapse") : t("expand")}
          className="flex size-6 shrink-0 items-center justify-center rounded-full text-slate-400 dark:text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300"
        >
          {expanded ? (
            <Minimize2 className="size-3.5" strokeWidth={1.5} />
          ) : (
            <Maximize2 className="size-3.5" strokeWidth={1.5} />
          )}
        </button>
        <button
          type="button"
          onClick={onDiscard}
          aria-label={t("discard")}
          title={t("discard")}
          className="flex size-6 shrink-0 items-center justify-center rounded-full text-slate-500 dark:text-slate-400 transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <X className="size-3.5" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {expanded && (
        <div
          aria-hidden
          onClick={() => setExpanded(false)}
          className="fixed inset-0 z-50 bg-black/30"
        />
      )}
      <div
        className={cn(
          "flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-lg shadow-slate-100/80 dark:shadow-black/40",
          expanded
            ? "fixed top-1/2 left-1/2 z-50 h-[50vh] w-[50vw] -translate-x-1/2 -translate-y-1/2 shadow-2xl"
            : "relative mt-8",
        )}
      >
        {header}
        <div className={cn("flex flex-col", expanded && "min-h-0 flex-1 overflow-y-auto")}>
          <ComposerBody
            ref={composerRef}
            signature={signature}
            autoInsertSignature={autoInsertSignature}
            onRequestCreateSignature={onRequestCreateSignature}
            composerDisplayName={composerDisplayName}
            composerAvatarDataUrl={composerAvatarDataUrl}
            voiceNotesEnabled={voiceNotesEnabled}
            placeholder={t("replyPlaceholder")}
            footer={footer}
            grow={expanded}
          />
        </div>
      </div>
    </>
  );
}

function MailSidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  selection,
  viewMode,
  unreadCounts,
  onSelectFolder,
  onCompose,
  onFolders,
  onContacts,
  onSettings,
  onLogout,
}: {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  selection: Selection;
  viewMode: "mail" | "contacts" | "folders" | "settings";
  unreadCounts: Partial<Record<MailFolder, number>>;
  onSelectFolder: (folder: MailFolder) => void;
  onCompose: () => void;
  onFolders: () => void;
  onContacts: () => void;
  onSettings: () => void;
  onLogout: () => void;
}) {
  const t = useTranslations("Dashboard.mailPage");
  const tNav = useTranslations("Dashboard.nav");
  const foldersActive = viewMode === "folders" || (viewMode === "mail" && selection.type === "custom");

  const navButtonClass = (active: boolean) =>
    cn(
      "group flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm transition-colors",
      collapsed && "justify-center",
      active ? "bg-primary/10" : "hover:bg-primary/10",
    );

  const navIconClass = (active: boolean) =>
    cn("size-5 shrink-0", active ? "text-primary" : "text-slate-500 dark:text-slate-400 group-hover:text-primary");

  const navLabelClass = (active: boolean) =>
    cn(
      "truncate",
      active
        ? "font-semibold text-primary"
        : "font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary",
    );

  return (
    <>
      {mobileOpen && (
        <div
          aria-hidden
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
        />
      )}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-full w-64 shrink-0 flex-col bg-mail-sidebar transition-transform duration-300 ease-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "lg:static lg:z-auto lg:translate-x-0 lg:transition-all lg:duration-200",
          collapsed ? "lg:w-[72px]" : "lg:w-64",
        )}
      >
      <div
        className={cn(
          "flex h-16 items-center gap-2 px-4",
          collapsed && "justify-center px-0",
        )}
      >
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? tNav("expand") : tNav("collapse")}
          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 transition-colors hover:bg-primary/10 hover:text-primary"
        >
          <Menu className="size-5" strokeWidth={1.5} />
        </button>
        {!collapsed && <Logo className="h-6 w-auto text-foreground" />}
      </div>

      <div className="px-3 pb-2">
        <Button
          className={cn(
            "w-full hover:brightness-110",
            premiumButton,
            collapsed && "justify-center px-0",
          )}
          onClick={() => {
            onCompose();
            onCloseMobile();
          }}
        >
          <SquarePen className="size-5" strokeWidth={1.5} />
          {!collapsed && t("compose")}
        </Button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 pt-2">
        {FOLDER_ORDER.map((folder) => {
          const Icon = FOLDER_ICONS[folder];
          const active =
            viewMode === "mail" && selection.type === "folder" && selection.folder === folder;
          const count = unreadCounts[folder] ?? 0;
          return (
            <button
              key={folder}
              type="button"
              title={collapsed ? t(`folders.${folder}`) : undefined}
              onClick={() => {
                onSelectFolder(folder);
                onCloseMobile();
              }}
              className={navButtonClass(active)}
            >
              <span className={cn("flex items-center gap-2.5", collapsed && "justify-center")}>
                <Icon className={navIconClass(active)} strokeWidth={1.5} />
                {!collapsed && <span className={navLabelClass(active)}>{t(`folders.${folder}`)}</span>}
              </span>
              {!collapsed && count > 0 && (
                <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                  {count}
                </span>
              )}
            </button>
          );
        })}

        <div className="mt-1 flex flex-col gap-1">
          <button
            type="button"
            title={collapsed ? t("foldersSection") : undefined}
            onClick={() => {
              onFolders();
              onCloseMobile();
            }}
            className={navButtonClass(foldersActive)}
          >
            <span className={cn("flex items-center gap-2.5", collapsed && "justify-center")}>
              <Folder className={navIconClass(foldersActive)} strokeWidth={1.5} />
              {!collapsed && (
                <span className={navLabelClass(foldersActive)}>{t("foldersSection")}</span>
              )}
            </span>
          </button>
          <button
            type="button"
            title={collapsed ? t("contacts") : undefined}
            onClick={() => {
              onContacts();
              onCloseMobile();
            }}
            className={navButtonClass(viewMode === "contacts")}
          >
            <span className={cn("flex items-center gap-2.5", collapsed && "justify-center")}>
              <Users className={navIconClass(viewMode === "contacts")} strokeWidth={1.5} />
              {!collapsed && (
                <span className={navLabelClass(viewMode === "contacts")}>{t("contacts")}</span>
              )}
            </span>
          </button>
          <button
            type="button"
            title={collapsed ? t("settingsNav") : undefined}
            onClick={() => {
              onSettings();
              onCloseMobile();
            }}
            className={navButtonClass(viewMode === "settings")}
          >
            <span className={cn("flex items-center gap-2.5", collapsed && "justify-center")}>
              <SettingsIcon
                className={navIconClass(viewMode === "settings")}
                strokeWidth={1.5}
              />
              {!collapsed && (
                <span className={navLabelClass(viewMode === "settings")}>
                  {t("settingsNav")}
                </span>
              )}
            </span>
          </button>
        </div>
      </nav>

      <div className="border-t border-slate-200 dark:border-slate-800 p-3">
        <button
          type="button"
          title={collapsed ? t("logout") : undefined}
          onClick={onLogout}
          className={cn(
            "group flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors hover:bg-destructive/10",
            collapsed && "justify-center",
          )}
        >
          <LogOut
            className="size-5 shrink-0 text-slate-500 dark:text-slate-400 group-hover:text-destructive"
            strokeWidth={1.5}
          />
          {!collapsed && (
            <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-destructive">
              {t("logout")}
            </span>
          )}
        </button>
      </div>
      </div>
    </>
  );
}

const SIDEBAR_COLLAPSE_KEY = "marrowmail.mail.sidebar.collapsed";

export default function MailPage() {
  const t = useTranslations("Dashboard.mailPage");
  const locale = useLocale();
  const router = useRouter();
  const { show } = useToast();
  const [account, setAccount] = useState<OnboardingAccount | null>(null);
  const [checked, setChecked] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [selection, setSelection] = useState<Selection>({ type: "folder", folder: "inbox" });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [replyOpen, setReplyOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState<string | undefined>(undefined);
  const [composeAutoSchedule, setComposeAutoSchedule] = useState(false);
  const [forwardingId, setForwardingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"mail" | "contacts" | "folders" | "settings">("mail");
  const [settingsAutoOpenModal, setSettingsAutoOpenModal] = useState<"signature" | null>(null);
  const [folders, setFolders] = useState<FolderRecord[]>([]);
  const [displayName, setDisplayName] = useState("");
  const signature = account
    ? buildSignatureHtml(account.mailPreferences.signature, account.mailPreferences.avatarDataUrl)
    : "";
  const [detailContact, setDetailContact] = useState<SenderContact | null>(null);
  const [contactSearch, setContactSearch] = useState("");

  useEffect(() => {
    const stored = loadAccount();
    if (!stored) {
      router.replace("/onboarding");
      return;
    }
    setAccount(stored);
    setDisplayName(stored.ownerName);
    setCollapsed(window.localStorage.getItem(SIDEBAR_COLLAPSE_KEY) === "1");
    setChecked(true);

    fetchAllMailMessages().then(setMessages);
    getFolders().then(setFolders);

    getMailAccountProfile().then((profile) => {
      if (!profile) return;
      setAccount((prev) =>
        prev
          ? {
              ...prev,
              mailPreferences: {
                ...prev.mailPreferences,
                twoFactorEnabled: profile.twoFactorEnabled ?? prev.mailPreferences.twoFactorEnabled,
                forwardingEmail: profile.forwardingEmail ?? prev.mailPreferences.forwardingEmail,
                forwardingVerified:
                  profile.forwardingVerified ?? prev.mailPreferences.forwardingVerified,
                keepForwardedCopy:
                  profile.keepForwardedCopy ?? prev.mailPreferences.keepForwardedCopy,
              },
            }
          : prev,
      );
    });

    getSignature().then((signature) => {
      if (!signature) return;
      setAccount((prev) =>
        prev
          ? {
              ...prev,
              mailPreferences: {
                ...prev.mailPreferences,
                signature: signatureToSettings(signature),
              },
            }
          : prev,
      );
    });
  }, [router]);

  const unreadCounts = useMemo(() => {
    const counts: Partial<Record<MailFolder, number>> = {};
    for (const folder of FOLDER_ORDER) {
      counts[folder] =
        folder === "important"
          ? messages.filter((m) => m.starred && !m.read && m.folder !== "trash").length
          : folder === "inbox"
            ? messages.filter((m) => m.folder === "inbox" && !m.read && !m.archived).length
            : messages.filter((m) => m.folder === folder && !m.read).length;
    }
    return counts;
  }, [messages]);

  const folderMessages = useMemo(() => {
    if (selection.type === "custom") {
      return messages.filter((m) => m.folderId === selection.id && m.folder !== "trash");
    }
    if (selection.folder === "important") {
      return messages.filter((m) => m.starred && m.folder !== "trash");
    }
    if (selection.folder === "inbox") {
      return messages.filter((m) => m.folder === "inbox" && !m.archived);
    }
    return messages.filter((m) => m.folder === selection.folder);
  }, [messages, selection]);

  const visibleMessages = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = query
      ? folderMessages.filter(
          (m) =>
            m.subject.toLowerCase().includes(query) ||
            m.fromName.toLowerCase().includes(query) ||
            m.fromEmail.toLowerCase().includes(query) ||
            m.preview.toLowerCase().includes(query),
        )
      : folderMessages;
    return [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [folderMessages, search]);

  const contacts = useMemo(() => {
    const map = new Map<string, { name: string; lastActivity: string; messageCount: number }>();
    function record(email: string, name: string, date: string) {
      const existing = map.get(email);
      if (existing) {
        existing.messageCount += 1;
        if (date > existing.lastActivity) existing.lastActivity = date;
      } else {
        map.set(email, { name, lastActivity: date, messageCount: 1 });
      }
    }
    for (const m of messages) {
      if (m.fromEmail && m.fromName && m.fromName !== "You") {
        record(m.fromEmail, m.fromName, m.date);
      }
      if (m.folder === "sent" && m.toEmail) {
        record(m.toEmail, m.toEmail.split("@")[0], m.date);
      }
    }
    const domain = account?.domain;
    return Array.from(map.entries())
      .map(([email, info]) => ({
        email,
        name: info.name,
        lastActivity: info.lastActivity,
        messageCount: info.messageCount,
        isTeam: domain ? email.toLowerCase().endsWith(`@${domain.toLowerCase()}`) : false,
      }))
      .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
  }, [messages, account]);

  const selected = messages.find((m) => m.id === selectedId) ?? null;

  if (!checked || !account) return null;

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(SIDEBAR_COLLAPSE_KEY, next ? "1" : "0");
      return next;
    });
  }

  function selectFolder(folder: MailFolder) {
    setSelection({ type: "folder", folder });
    setSelectedId(null);
    setViewMode("mail");
  }

  function selectCustomFolder(folder: FolderRecord) {
    setSelection({ type: "custom", id: folder.id, name: folder.name });
    setSelectedId(null);
    setViewMode("mail");
  }

  async function handleAddFolder() {
    const name = window.prompt(t("newFolderPrompt"))?.trim();
    if (!name) return;
    const folder = await createFolderApi({ name });
    if (!folder) {
      show(t("addFolderFailed"), "error");
      return;
    }
    setFolders((prev) => [...prev, folder]);
    selectCustomFolder(folder);
  }

  async function handleDeleteFolder(folder: FolderRecord) {
    const ok = await deleteFolderApi(folder.id);
    if (!ok) {
      show(t("deleteFolderFailed"), "error");
      return;
    }
    setFolders((prev) => prev.filter((f) => f.id !== folder.id));
    setMessages((prev) =>
      prev.map((m) => (m.folderId === folder.id ? { ...m, folderId: null } : m)),
    );
    if (selection.type === "custom" && selection.id === folder.id) {
      selectFolder("inbox");
    }
  }

  function handleMoveToFolder(id: string, folderId: number | null) {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, folderId } : m)));
    moveMailToFolder(Number(id), { folderId });
  }

  function selectMessage(id: string) {
    setSelectedId(id);
    setReplyOpen(false);
    const message = messages.find((m) => m.id === id);
    if (message && !message.read) {
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read: true } : m)));
      markMailRead(Number(id), true);
    }
  }

  function toggleStar(id: string) {
    const message = messages.find((m) => m.id === id);
    if (!message) return;
    const starred = !message.starred;
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, starred } : m)));
    markMailImportant(Number(id), { important: starred });
  }

  function toggleRead(id: string) {
    const message = messages.find((m) => m.id === id);
    if (!message) return;
    const read = !message.read;
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read } : m)));
    markMailRead(Number(id), read);
  }

  function archiveMessage(id: string) {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, archived: true } : m)));
    show(t("messageArchived"), "info");
    setSelectedId(null);
    setReplyOpen(false);
  }

  function toggleSpam(id: string) {
    const message = messages.find((m) => m.id === id);
    if (!message) return;
    const nowSpam = message.folder !== "spam";
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, folder: nowSpam ? "spam" : "inbox" } : m)),
    );
    markMailSpam(Number(id), { isSpam: nowSpam });
    show(nowSpam ? t("movedToSpam") : t("markedNotSpam"), "info");
    setSelectedId(null);
    setReplyOpen(false);
  }

  function deleteMessage(id: string) {
    const message = messages.find((m) => m.id === id);
    if (!message) return;
    if (message.folder === "trash") {
      setMessages((prev) => prev.filter((m) => m.id !== id));
      permanentlyDeleteMail(Number(id));
      show(t("messageDeleted"), "info");
    } else {
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, folder: "trash" } : m)));
      trashMailApi(Number(id));
      show(t("movedToTrash"), "info");
    }
    setSelectedId(null);
    setReplyOpen(false);
  }

  // Restoring/un-scheduling can land the mail back in any system folder depending on its
  // underlying status, so these replace the local entry from the authoritative server response
  // instead of guessing the resulting folder client-side.
  async function restoreMessage(id: string) {
    const mail = await restoreMailApi(Number(id));
    if (!mail) return;
    setMessages((prev) => prev.map((m) => (m.id === id ? mailToEmailMessage(mail) : m)));
    show(t("messageRestored"), "info");
    setSelectedId(null);
  }

  async function cancelScheduledMessage(id: string) {
    const mail = await cancelScheduledMail(Number(id));
    if (!mail) return;
    setMessages((prev) => prev.map((m) => (m.id === id ? mailToEmailMessage(mail) : m)));
    show(t("scheduleCancelled"), "info");
    setSelectedId(null);
  }

  function splitAddresses(value?: string): string[] | undefined {
    const list = (value ?? "")
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
    return list.length > 0 ? list : undefined;
  }

  function attachmentIdsOf(attachments: EmailAttachment[]): number[] | undefined {
    const ids = attachments.map((a) => a.fileId).filter((id): id is number => id != null);
    return ids.length > 0 ? ids : undefined;
  }

  async function handleSend(payload: ComposeSendPayload) {
    const { to, cc, bcc, subject, bodyText, attachments, scheduledFor } = payload;
    const toAddresses = splitAddresses(to);
    if (!toAddresses) return;
    const attachmentIds = attachmentIdsOf(attachments);

    if (forwardingId) {
      const mail = await forwardMailApi(Number(forwardingId), {
        to: toAddresses,
        cc: splitAddresses(cc),
        bcc: splitAddresses(bcc),
        bodyText,
      });
      setForwardingId(null);
      if (!mail) {
        show(t("sendFailed"), "error");
        return;
      }
      setMessages((prev) => [mailToEmailMessage(mail), ...prev]);
      setComposeOpen(false);
      show(t("messageSent"), "success");
      return;
    }

    const mail = scheduledFor
      ? await scheduleMailApi({
          to: toAddresses,
          cc: splitAddresses(cc),
          bcc: splitAddresses(bcc),
          subject: subject || "(no subject)",
          bodyText,
          attachmentIds,
          scheduledAt: new Date(scheduledFor),
        })
      : await sendMailApi({
          to: toAddresses,
          cc: splitAddresses(cc),
          bcc: splitAddresses(bcc),
          subject: subject || "(no subject)",
          bodyText,
          attachmentIds,
        });

    if (!mail) {
      show(t("sendFailed"), "error");
      return;
    }

    setMessages((prev) => [mailToEmailMessage(mail), ...prev]);
    setComposeOpen(false);
    show(scheduledFor ? t("messageScheduled") : t("messageSent"), "success");
  }

  async function handleSendReply(payload: { bodyText: string; attachments: EmailAttachment[]; confidential: boolean }) {
    if (!selected) return;
    const subject = selected.subject.startsWith("Re: ") ? selected.subject : `Re: ${selected.subject}`;
    const mail = await sendMailApi({
      to: [selected.fromEmail],
      subject,
      bodyText: payload.bodyText,
      attachmentIds: attachmentIdsOf(payload.attachments),
    });

    if (!mail) {
      show(t("sendFailed"), "error");
      return;
    }

    setMessages((prev) => [mailToEmailMessage(mail), ...prev]);
    setReplyOpen(false);
    show(t("replySent"), "success");
  }

  function handleContactClick(contact: { name: string; email: string }) {
    setViewMode("mail");
    setSelection({ type: "folder", folder: "inbox" });
    setSearch(contact.email);
  }

  function handleComposeToContact(email: string) {
    setComposeTo(email);
    setComposeAutoSchedule(false);
    setComposeOpen(true);
  }

  function handleScheduleToContact(email: string) {
    setComposeTo(email);
    setComposeAutoSchedule(true);
    setComposeOpen(true);
  }

  async function handleAddContact(email: string) {
    const related = messages.find((m) => m.fromEmail === email);
    const displayName = related?.fromName || email.split("@")[0];
    const [firstName, ...rest] = displayName.split(" ");
    const contact = await createContactApi({
      firstName: firstName || email.split("@")[0],
      lastName: rest.length > 0 ? rest.join(" ") : undefined,
      email,
    });
    show(contact ? t("contactAdded") : t("addContactFailed"), contact ? "success" : "error");
  }

  function handleOpenMessageFromPanel(message: EmailMessage) {
    setDetailContact(null);
    setViewMode("mail");
    const folder = message.folderId ? folders.find((f) => f.id === message.folderId) : undefined;
    if (folder) {
      setSelection({ type: "custom", id: folder.id, name: folder.name });
    } else {
      setSelection({ type: "folder", folder: message.folder });
    }
    selectMessage(message.id);
  }

  async function handleSaveProfile(payload: {
    ownerName: string;
    jobTitle: string;
    avatarDataUrl: string | null;
  }): Promise<boolean> {
    if (!account) return false;
    const [firstName, ...rest] = payload.ownerName.trim().split(/\s+/);
    const updated = await updateMailAccountProfile({
      firstName: firstName || undefined,
      lastName: rest.length > 0 ? rest.join(" ") : undefined,
      avatar: payload.avatarDataUrl,
    });
    if (!updated) return false;

    setDisplayName(payload.ownerName);
    const next: OnboardingAccount = {
      ...account,
      ownerName: payload.ownerName,
      mailPreferences: {
        ...account.mailPreferences,
        jobTitle: payload.jobTitle,
        avatarDataUrl: payload.avatarDataUrl,
      },
    };
    saveAccount(next);
    setAccount(next);
    return true;
  }

  function handleSelectTheme(theme: MailPreferences["theme"]) {
    if (!account) return;
    const next: OnboardingAccount = {
      ...account,
      mailPreferences: { ...account.mailPreferences, theme },
    };
    saveAccount(next);
    setAccount(next);
  }

  function handleTwoFactorChanged(enabled: boolean) {
    if (!account) return;
    const next: OnboardingAccount = {
      ...account,
      mailPreferences: {
        ...account.mailPreferences,
        twoFactorEnabled: enabled,
      },
    };
    saveAccount(next);
    setAccount(next);
  }

  async function handleSaveForwarding(payload: {
    forwardingEmail: string;
    forwardingVerified: boolean;
    keepForwardedCopy: boolean;
  }): Promise<boolean> {
    if (!account) return false;
    const ok = await updateForwardingPreferences({ keepForwardedCopy: payload.keepForwardedCopy });
    if (!ok) return false;

    const next: OnboardingAccount = {
      ...account,
      mailPreferences: {
        ...account.mailPreferences,
        forwardingEmail: payload.forwardingEmail,
        keepForwardedCopy: payload.keepForwardedCopy,
      },
    };
    saveAccount(next);
    setAccount(next);
    return true;
  }

  async function handleSaveSignature(payload: SignatureSettings): Promise<boolean> {
    if (!account) return false;
    const parsed = updateSignatureSchema.safeParse(payload);
    if (!parsed.success) return false;

    const saved = await updateSignature(parsed.data);
    if (!saved) return false;

    const next: OnboardingAccount = {
      ...account,
      mailPreferences: { ...account.mailPreferences, signature: signatureToSettings(saved) },
    };
    saveAccount(next);
    setAccount(next);
    return true;
  }

  function handleLogout() {
    if (account) {
      router.push(`/team-login/${account.domain}`);
    } else {
      router.push("/");
    }
  }

  function handleRequestCreateSignature() {
    setComposeOpen(false);
    setReplyOpen(false);
    setSettingsAutoOpenModal("signature");
    setViewMode("settings");
  }

  function handleImportComplete(provider: string) {
    if (!account) return;
    const mailboxEmail = account.mailboxes[0]
      ? `${account.mailboxes[0].username}@${account.domain}`
      : `hello@${account.domain}`;
    const imported = generateImportedMessages(provider, mailboxEmail);
    setMessages((prev) => [...imported, ...prev]);
    selectFolder("inbox");
    show(t("import.importedToast", { count: imported.length, provider }), "success");
  }

  function avatarNameFor(message: EmailMessage) {
    return message.fromName === "You" ? displayName || "You" : message.fromName;
  }

  return (
    <div
      className={cn(
        "flex h-screen w-full overflow-hidden bg-mail-canvas",
        account?.mailPreferences.theme === "dark" && "dark",
      )}
    >
      <MailSidebar
        collapsed={collapsed}
        onToggleCollapse={toggleCollapsed}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
        selection={selection}
        viewMode={viewMode}
        unreadCounts={unreadCounts}
        onSelectFolder={selectFolder}
        onCompose={() => {
          setComposeTo(undefined);
          setComposeAutoSchedule(false);
          setComposeOpen(true);
        }}
        onFolders={() => setViewMode("folders")}
        onContacts={() => setViewMode("contacts")}
        onSettings={() => {
          setViewMode("settings");
          setSettingsAutoOpenModal(null);
        }}
        onLogout={handleLogout}
      />

      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <button
          type="button"
          onClick={() => setMobileNavOpen(true)}
          aria-label={t("settingsNav")}
          className="absolute top-4 left-4 z-30 flex size-9 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 shadow-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 lg:hidden"
        >
          <Menu className="size-4" strokeWidth={1.5} />
        </button>
        {account && (
          <ThemeMenu theme={account.mailPreferences.theme} onSelect={handleSelectTheme} />
        )}
        {viewMode === "settings" ? (
          <div className="flex-1 overflow-y-auto p-6 pt-16 sm:p-10 sm:pt-16 lg:pt-16">
            {account && (
              <MailSettingsView
                account={account}
                displayName={displayName}
                onSaveProfile={handleSaveProfile}
                onTwoFactorChanged={handleTwoFactorChanged}
                onSaveForwarding={handleSaveForwarding}
                onSaveSignature={handleSaveSignature}
                onImportComplete={handleImportComplete}
                initialModal={settingsAutoOpenModal}
              />
            )}
          </div>
        ) : viewMode === "folders" ? (
          <div className="flex-1 overflow-y-auto p-6 pt-16 sm:p-10 sm:pt-16 lg:pt-16">
            <h2 className="text-xs font-semibold tracking-wider text-foreground/75 uppercase">
              {t("foldersSection")}
            </h2>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 text-left transition-colors hover:border-primary/30 hover:bg-muted/40"
                >
                  <button
                    type="button"
                    onClick={() => selectCustomFolder(folder)}
                    className="flex min-w-0 flex-1 items-center gap-3"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Folder className="size-5" strokeWidth={1.5} />
                    </span>
                    <span className="truncate text-sm font-medium text-foreground">{folder.name}</span>
                  </button>
                  <button
                    type="button"
                    title={t("deleteFolder")}
                    onClick={() => handleDeleteFolder(folder)}
                    className="flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground opacity-0 transition-colors group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="size-3.5" strokeWidth={1.5} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddFolder}
                className="flex items-center gap-3 rounded-2xl border border-dashed border-border p-3.5 text-left text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                  <Plus className="size-5" strokeWidth={1.5} />
                </span>
                <span className="truncate text-sm font-medium">{t("addFolder")}</span>
              </button>
            </div>
          </div>
        ) : viewMode === "contacts" ? (
          <div className="flex-1 overflow-y-auto p-6 pt-16 sm:p-10 sm:pt-16 lg:pt-16">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xs font-semibold tracking-wider text-foreground/75 uppercase">
                {t("contacts")}
              </h2>
              <div className="relative">
                <Search
                  className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                  strokeWidth={1.5}
                />
                <input
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                  placeholder={t("searchContactsPlaceholder")}
                  className="h-9 w-full rounded-lg border border-border bg-background pr-3 pl-9 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary sm:w-56"
                />
              </div>
            </div>

            {(() => {
              const query = contactSearch.trim().toLowerCase();
              const filtered = query
                ? contacts.filter(
                    (c) =>
                      c.name.toLowerCase().includes(query) ||
                      c.email.toLowerCase().includes(query),
                  )
                : contacts;
              const teamContacts = filtered.filter((c) => c.isTeam);
              const externalContacts = filtered.filter((c) => !c.isTeam);

              if (contacts.length === 0) {
                return (
                  <p className="mt-6 text-sm text-muted-foreground">{t("contactsEmpty")}</p>
                );
              }
              if (filtered.length === 0) {
                return (
                  <p className="mt-6 text-sm text-muted-foreground">{t("noContactsFound")}</p>
                );
              }

              const renderGroup = (label: string, group: typeof filtered) =>
                group.length > 0 && (
                  <div key={label}>
                    <h3 className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      {label}
                    </h3>
                    <div className="flex flex-col divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
                      {group.map((contact) => (
                        <div
                          key={contact.email}
                          className="group flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/40"
                        >
                          <SenderPreviewCard
                            name={contact.name}
                            email={contact.email}
                            onSendMail={handleComposeToContact}
                            onScheduleMail={handleScheduleToContact}
                            onAddToContacts={handleAddContact}
                            onViewDetails={(c) => setDetailContact(c)}
                          >
                            <ContactAvatar
                              name={contact.name}
                              email={contact.email}
                              className="size-10 text-sm"
                            />
                          </SenderPreviewCard>
                          <button
                            type="button"
                            onClick={() => handleContactClick(contact)}
                            className="flex min-w-0 flex-1 items-center gap-3 text-left"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-foreground">
                                {contact.name}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {contact.email}
                              </p>
                            </div>
                          </button>
                          <p className="hidden shrink-0 text-right text-xs text-muted-foreground sm:block">
                            {t("messagesCount", { count: contact.messageCount })}
                            <br />
                            {t("lastContacted", {
                              date: formatMessageTime(contact.lastActivity, locale),
                            })}
                          </p>
                          <button
                            type="button"
                            title={t("composeToContact")}
                            onClick={() => handleComposeToContact(contact.email)}
                            className="flex size-9 shrink-0 items-center justify-center rounded-full text-slate-400 dark:text-slate-500 opacity-0 transition-all group-hover:opacity-100 hover:bg-primary/10 hover:text-primary"
                          >
                            <Mail className="size-4" strokeWidth={1.5} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );

              return (
                <div className="mt-6 flex flex-col gap-6">
                  {renderGroup(t("teamContacts"), teamContacts)}
                  {renderGroup(t("externalContacts"), externalContacts)}
                </div>
              );
            })()}
          </div>
        ) : selected ? (
          <div className="flex h-full flex-col p-6 pt-16 sm:p-10 sm:pt-16 md:py-10 md:pt-16 md:pr-10 md:pl-20 lg:pt-16">
            <button
              type="button"
              onClick={() => {
                setSelectedId(null);
                setReplyOpen(false);
              }}
              className="mb-5 flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="size-4" strokeWidth={1.5} />
              {t("backToList")}
            </button>
            <div className="flex min-h-0 flex-1 justify-center">
            <div className="relative flex min-h-0 w-full max-w-3xl flex-1 flex-col overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-lg shadow-slate-100/80 dark:shadow-black/40">
              {!replyOpen && (
                <button
                  type="button"
                  title={t("aiAssistant")}
                  onClick={() => show(t("aiComingSoon"), "info")}
                  className="absolute right-6 bottom-6 z-10 flex size-12 items-center justify-center rounded-full bg-ai-accent text-ai-accent-foreground shadow-lg shadow-ai-accent/30 transition-transform hover:scale-105"
                >
                  <Sparkles className="size-5" strokeWidth={1.5} />
                </button>
              )}
              <div className="shrink-0 p-8 pb-0 md:p-12 md:pb-0">
                <div className="mb-8 flex items-center justify-start gap-1 rounded-xl border border-primary/10 bg-primary/5 px-2 py-1.5 shadow-xs">
                  <button
                    type="button"
                    title={t("archive")}
                    onClick={() => archiveMessage(selected.id)}
                    className="flex size-8 items-center justify-center rounded-lg text-slate-900 dark:text-slate-50 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-white dark:hover:bg-slate-900 hover:text-primary hover:shadow-xs"
                  >
                    <Archive className="size-4" strokeWidth={1.5} />
                  </button>
                  <button
                    type="button"
                    title={selected.folder === "spam" ? t("notSpam") : t("markSpam")}
                    onClick={() => toggleSpam(selected.id)}
                    className="flex size-8 items-center justify-center rounded-lg text-slate-900 dark:text-slate-50 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-white dark:hover:bg-slate-900 hover:text-primary hover:shadow-xs"
                  >
                    <ShieldAlert
                      className={cn("size-4", selected.folder === "spam" && "text-destructive")}
                      strokeWidth={1.5}
                    />
                  </button>
                  <button
                    type="button"
                    title={selected.folder === "trash" ? t("deleteForever") : t("delete")}
                    onClick={() => deleteMessage(selected.id)}
                    className="flex size-8 items-center justify-center rounded-lg text-slate-900 dark:text-slate-50 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-destructive/10 hover:text-destructive hover:shadow-xs"
                  >
                    <Trash2 className="size-4" strokeWidth={1.5} />
                  </button>
                  {selected.folder === "trash" && (
                    <button
                      type="button"
                      title={t("restore")}
                      onClick={() => restoreMessage(selected.id)}
                      className="flex size-8 items-center justify-center rounded-lg text-slate-900 dark:text-slate-50 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-white dark:hover:bg-slate-900 hover:text-primary hover:shadow-xs"
                    >
                      <ArchiveRestore className="size-4" strokeWidth={1.5} />
                    </button>
                  )}
                  {selected.folder === "scheduled" && (
                    <button
                      type="button"
                      title={t("cancelSchedule")}
                      onClick={() => cancelScheduledMessage(selected.id)}
                      className="flex size-8 items-center justify-center rounded-lg text-slate-900 dark:text-slate-50 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-destructive/10 hover:text-destructive hover:shadow-xs"
                    >
                      <X className="size-4" strokeWidth={1.5} />
                    </button>
                  )}
                  <button
                    type="button"
                    title={selected.read ? t("markUnread") : t("markRead")}
                    onClick={() => toggleRead(selected.id)}
                    className="flex size-8 items-center justify-center rounded-lg text-slate-900 dark:text-slate-50 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-white dark:hover:bg-slate-900 hover:text-primary hover:shadow-xs"
                  >
                    {selected.read ? (
                      <Mail className="size-4" strokeWidth={1.5} />
                    ) : (
                      <MailOpen className="size-4" strokeWidth={1.5} />
                    )}
                  </button>
                  <div
                    title={t("moveToFolder")}
                    className="relative flex size-8 items-center justify-center rounded-lg text-slate-900 dark:text-slate-50 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-white dark:hover:bg-slate-900 hover:text-primary hover:shadow-xs"
                  >
                    <FolderInput className="pointer-events-none size-4" strokeWidth={1.5} />
                    <select
                      value={selected.folderId ?? ""}
                      onChange={(e) =>
                        handleMoveToFolder(selected.id, e.target.value ? Number(e.target.value) : null)
                      }
                      aria-label={t("moveToFolder")}
                      className="absolute inset-0 size-full cursor-pointer opacity-0"
                    >
                      <option value="">{t("noFolder")}</option>
                      {folders.map((folder) => (
                        <option key={folder.id} value={folder.id}>
                          {folder.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    title={selected.starred ? t("unstar") : t("star")}
                    onClick={() => toggleStar(selected.id)}
                    className={cn(
                      "flex size-8 items-center justify-center rounded-lg transition-all duration-200 ease-out hover:-translate-y-0.5 hover:bg-primary/10 hover:text-primary hover:shadow-xs",
                      selected.starred ? "text-primary" : "text-slate-900 dark:text-slate-50",
                    )}
                  >
                    <Star
                      className={cn("size-4", selected.starred && "fill-primary")}
                      strokeWidth={1.5}
                    />
                  </button>
                </div>

                <div className="mt-4 flex min-w-0 items-start gap-3">
                  <SenderPreviewCard
                    name={avatarNameFor(selected)}
                    email={selected.fromEmail}
                    onSendMail={handleComposeToContact}
                    onScheduleMail={handleScheduleToContact}
                    onAddToContacts={handleAddContact}
                    onViewDetails={(c) => setDetailContact(c)}
                  >
                    <ContactAvatar
                      name={avatarNameFor(selected)}
                      email={selected.fromEmail}
                      className="size-11 text-sm"
                    />
                  </SenderPreviewCard>
                  <div className="min-w-0">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50 sm:text-2xl">
                      {selected.subject}
                    </h2>
                    <p className="mt-1.5 truncate text-sm">
                      <span className="text-muted-foreground">{t("from")}: </span>
                      <span className="font-semibold text-slate-900 dark:text-slate-50">{selected.fromName}</span>{" "}
                      <span className="font-normal text-slate-400 dark:text-slate-500">
                        &lt;{selected.fromEmail}&gt;
                      </span>
                    </p>
                    {selected.ccEmail && (
                      <p className="mt-0.5 truncate text-sm text-muted-foreground">
                        {t("cc")}: {selected.ccEmail}
                      </p>
                    )}
                    {selected.bccEmail && (
                      <p className="mt-0.5 truncate text-sm text-muted-foreground">
                        {t("bcc")}: {selected.bccEmail}
                      </p>
                    )}
                    {selected.scheduledFor && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t("sendsAt", {
                          date: formatMessageTime(selected.scheduledFor, locale),
                        })}
                      </p>
                    )}
                  </div>
                </div>

                {selected.attachments && selected.attachments.length > 0 && (
                  <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                    {selected.attachments.map((att, i) =>
                      att.type === "voice" ? (
                        <div key={i} className="sm:col-span-2">
                          <VoiceMessageCard
                            audioDataUrl={att.audioDataUrl}
                            durationSec={att.durationSec}
                            recorderName={selected.fromName}
                            recorderAvatarDataUrl={
                              selected.fromName === "You"
                                ? (account?.mailPreferences.avatarDataUrl ?? null)
                                : null
                            }
                            cardColor={att.cardColor}
                          />
                        </div>
                      ) : (
                        <div
                          key={i}
                          className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 p-3"
                        >
                          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                            {(() => {
                              const AttIcon = ATTACHMENT_ICONS[att.type];
                              return <AttIcon className="size-4" strokeWidth={1.5} />;
                            })()}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-300">
                              {att.name}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {formatFileSize(att.sizeKb)}
                            </p>
                          </div>
                          <button
                            type="button"
                            aria-label={t("downloadAttachment")}
                            onClick={() => show(t("downloadComingSoon"), "info")}
                            className="flex size-8 shrink-0 items-center justify-center rounded-full text-slate-500 dark:text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary"
                          >
                            <Download className="size-4" strokeWidth={1.5} />
                          </button>
                        </div>
                      ),
                    )}
                  </div>
                )}

                <div className="mt-6 border-t border-slate-100 dark:border-slate-800" />
              </div>

              <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-8 pb-8 md:px-12 md:pb-12">
                <p className="pt-6 text-sm leading-relaxed whitespace-pre-line text-slate-700 dark:text-slate-300 sm:text-base">
                  {selected.body}
                </p>

                {!replyOpen && (
                  <div className="mt-6 inline-flex items-center gap-1 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/70 p-1 shadow-xs">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full border border-primary/30 bg-primary/10 text-primary transition-all duration-200 hover:border-primary hover:bg-primary hover:text-primary-foreground hover:shadow-sm"
                      onClick={() => setReplyOpen(true)}
                    >
                      <Reply className="size-4" strokeWidth={1.5} />
                      {t("reply")}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-full border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-50 hover:shadow-xs"
                      onClick={() => {
                        setForwardingId(selected.id);
                        setComposeOpen(true);
                      }}
                    >
                      <Forward className="size-4" strokeWidth={1.5} />
                      {t("forward")}
                    </Button>
                  </div>
                )}

                {replyOpen && (
                  <ReplyComposer
                    toEmail={selected.fromEmail}
                    signature={signature}
                    autoInsertSignature={account?.mailPreferences.signature.includeInReplies}
                    onRequestCreateSignature={handleRequestCreateSignature}
                    composerDisplayName={displayName || account?.ownerName || "You"}
                    composerAvatarDataUrl={account?.mailPreferences.avatarDataUrl ?? null}
                    voiceNotesEnabled={account ? hasVoiceNotes(account) : false}
                    onDiscard={() => setReplyOpen(false)}
                    onSend={handleSendReply}
                  />
                )}
              </div>
            </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col p-6 pt-16 lg:pt-6">
            <div className="mb-4 shrink-0">
              <div className="relative max-w-md">
                <Search
                  className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                  strokeWidth={1.5}
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t("searchPlaceholder")}
                  className="h-9 w-full rounded-lg border border-border bg-background pr-3 pl-9 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary"
                />
              </div>
            </div>
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pb-2">
              {visibleMessages.length === 0 ? (
                <p className="p-6 text-center text-sm text-muted-foreground">
                  {search ? t("noMessagesFound") : t("emptyFolder")}
                </p>
              ) : (
                visibleMessages.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-xl border border-slate-200/70 dark:border-slate-800/70 bg-white dark:bg-slate-900 px-5 py-4 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md",
                      !m.read && "bg-primary/5",
                    )}
                  >
                    <SenderPreviewCard
                      name={avatarNameFor(m)}
                      email={m.fromEmail}
                      onSendMail={handleComposeToContact}
                      onScheduleMail={handleScheduleToContact}
                      onAddToContacts={handleAddContact}
                      onViewDetails={(c) => setDetailContact(c)}
                    >
                      <ContactAvatar
                        name={avatarNameFor(m)}
                        email={m.fromEmail}
                        className="mt-0.5 size-9 text-xs"
                      />
                    </SenderPreviewCard>
                    <button
                      type="button"
                      onClick={() => selectMessage(m.id)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            "truncate text-sm",
                            !m.read ? "font-semibold text-slate-900 dark:text-slate-50" : "font-medium text-slate-500 dark:text-slate-400",
                          )}
                        >
                          {m.fromName}
                        </span>
                        <span className="shrink-0 text-xs tracking-wide tabular-nums text-slate-400 dark:text-slate-500">
                          {formatMessageTime(m.date, locale)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {!m.read && <span className="size-2 shrink-0 rounded-full bg-primary" />}
                        <span
                          className={cn(
                            "truncate text-sm",
                            !m.read ? "font-semibold text-slate-900 dark:text-slate-50" : "font-normal text-slate-500 dark:text-slate-400",
                          )}
                        >
                          {m.subject}
                        </span>
                        {m.starred && (
                          <Star
                            className="size-3 shrink-0 fill-amber-400 text-amber-500"
                            strokeWidth={1.5}
                          />
                        )}
                        {m.importedFrom && (
                          <span className="shrink-0 rounded-full bg-accent px-1.5 py-0.5 text-[9px] font-medium tracking-wide text-accent-foreground uppercase">
                            {t("import.importedBadge")}
                          </span>
                        )}
                      </div>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">{m.preview}</p>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {composeOpen && (
        <ComposeDialog
          onClose={() => {
            setComposeOpen(false);
            setForwardingId(null);
          }}
          onSend={handleSend}
          signature={signature}
          autoInsertSignature={account?.mailPreferences.signature.includeInNewEmails}
          onRequestCreateSignature={handleRequestCreateSignature}
          composerDisplayName={displayName || account?.ownerName || "You"}
          composerAvatarDataUrl={account?.mailPreferences.avatarDataUrl ?? null}
          voiceNotesEnabled={account ? hasVoiceNotes(account) : false}
          initialTo={composeTo}
          initialScheduleEnabled={composeAutoSchedule}
        />
      )}
      {detailContact && (
        <ContactDetailPanel
          contact={detailContact}
          messages={messages}
          isTeam={
            contacts.find((c) => c.email === detailContact.email)?.isTeam ??
            (account?.domain
              ? detailContact.email.toLowerCase().endsWith(`@${account.domain.toLowerCase()}`)
              : false)
          }
          onClose={() => setDetailContact(null)}
          onOpenMessage={handleOpenMessageFromPanel}
          onSendMail={handleComposeToContact}
        />
      )}
    </div>
  );
}
