import { listDomains } from "@/services/domain.services";
import { getCurrentSubscription } from "@/services/subscription.services";

// The authoritative "has this user already finished onboarding" check —
// unlike loadAccount()/saveAccount() below (plain localStorage, so it only
// ever reflects the device/browser the wizard was completed on), this asks
// the backend directly, so it survives a new device, a cleared browser, or
// signing in as the same user somewhere else. An active subscription plus
// at least one domain is the same end-state the onboarding wizard itself
// treats as "complete" (see persistComplete() in app/[locale]/onboarding).
export async function hasCompletedOnboardingOnServer(): Promise<boolean> {
  const [subscription, domains] = await Promise.all([getCurrentSubscription(), listDomains()]);
  return subscription?.status === "active" && domains.length > 0;
}

export const MAILBOX_PRICE_XAF = 2500;

export const DURATION_OPTIONS = [1, 3, 6, 12] as const;
export type BillingMonths = (typeof DURATION_OPTIONS)[number];

export const DEFAULT_MAILBOX_STORAGE_GB = 10;

export type PlanId = "core" | "plus";

export interface PlanDefinition {
  id: PlanId;
  name: string;
  priceXaf: number;
  roleAliasLimit: number;
  voiceNotes: boolean;
  storageGB: number;
}

export const PLANS: Record<PlanId, PlanDefinition> = {
  core: {
    id: "core",
    name: "Core Plan",
    priceXaf: 2500,
    roleAliasLimit: 5,
    voiceNotes: false,
    storageGB: 10,
  },
  plus: {
    id: "plus",
    name: "Plus Plan",
    priceXaf: 3500,
    roleAliasLimit: 10,
    voiceNotes: true,
    storageGB: 15,
  },
};

export function getRoleAliasLimit(
  account: Pick<OnboardingAccount, "plan">,
): number {
  return PLANS[account.plan].roleAliasLimit;
}

export function hasVoiceNotes(
  account: Pick<OnboardingAccount, "plan">,
): boolean {
  return PLANS[account.plan].voiceNotes;
}

export interface Mailbox {
  id: string;
  username: string;
  fullName: string | null;
  assignedTo: string | null;
  invitationStatus: "accepted" | "pending" | "none";
  status: "active" | "disabled";
  storagePurchasedGB: number;
  createdAt: string;
}

export interface RoleAlias {
  id: string;
  alias: string;
  forwardsTo: string;
  status: "active" | "disabled";
  createdAt: string;
}

export interface WorkspaceBranding {
  companyName: string;
  welcomeMessage: string;
  logoDataUrl: string | null;
  accentColor: string | null;
}

export interface SignatureSettings {
  name: string;
  jobTitle: string;
  includePhoto: boolean;
  phone: string;
  website: string;
  address: string;
  linkedin: string;
  facebook: string;
  instagram: string;
  includeInNewEmails: boolean;
  includeInReplies: boolean;
}

export interface MailPreferences {
  jobTitle: string;
  avatarDataUrl: string | null;
  theme: "light" | "dark";
  twoFactorEnabled: boolean;
  forwardingEmail: string;
  forwardingVerified: boolean;
  keepForwardedCopy: boolean;
  signature: SignatureSettings;
}

export interface OnboardingAccount {
  hasDomain: boolean;
  domain: string;
  domainPrice: number | null;
  plan: PlanId;
  mailboxes: Mailbox[];
  roleAliases: RoleAlias[];
  dnsVerified: boolean;
  stage: "awaiting-dns" | "complete";
  createdAt: string;
  branding: WorkspaceBranding;
  ownerName: string;
  mailPreferences: MailPreferences;
  subscriptionStatus: "active" | "canceled";
  subscriptionId: number | null;
}

export function defaultSignatureSettings(): SignatureSettings {
  return {
    name: "",
    jobTitle: "",
    includePhoto: false,
    phone: "",
    website: "",
    address: "",
    linkedin: "",
    facebook: "",
    instagram: "",
    includeInNewEmails: true,
    includeInReplies: true,
  };
}

export function defaultMailPreferences(): MailPreferences {
  return {
    jobTitle: "",
    avatarDataUrl: null,
    theme: "light",
    twoFactorEnabled: false,
    forwardingEmail: "",
    forwardingVerified: false,
    keepForwardedCopy: true,
    signature: defaultSignatureSettings(),
  };
}

export function defaultBranding(): WorkspaceBranding {
  return {
    companyName: "",
    welcomeMessage: "Sign in to your business email",
    logoDataUrl: null,
    accentColor: null,
  };
}

const STORAGE_KEY = "marrowmail.onboarding.account";

function sanitizeMailbox(mailbox: Partial<Mailbox>): Mailbox {
  const createdAt =
    mailbox.createdAt && !Number.isNaN(new Date(mailbox.createdAt).getTime())
      ? mailbox.createdAt
      : new Date().toISOString();
  return {
    id: mailbox.id ?? makeId(),
    username: mailbox.username ?? "",
    fullName: mailbox.fullName ?? null,
    assignedTo: mailbox.assignedTo ?? null,
    invitationStatus:
      mailbox.invitationStatus ?? (mailbox.assignedTo ? "pending" : "none"),
    status: mailbox.status ?? "active",
    storagePurchasedGB:
      mailbox.storagePurchasedGB ?? DEFAULT_MAILBOX_STORAGE_GB,
    createdAt,
  };
}

function sanitizeRoleAlias(role: Partial<RoleAlias>): RoleAlias {
  return {
    id: role.id ?? makeId(),
    alias: role.alias ?? "",
    forwardsTo: role.forwardsTo ?? "",
    status: role.status ?? "active",
    createdAt: role.createdAt ?? new Date().toISOString(),
  };
}

export function loadAccount(): OnboardingAccount | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<OnboardingAccount>;
    return {
      ...parsed,
      plan: parsed.plan === "plus" ? "plus" : "core",
      mailboxes: (parsed.mailboxes ?? []).map(sanitizeMailbox),
      roleAliases: (parsed.roleAliases ?? []).map(sanitizeRoleAlias),
      createdAt: parsed.createdAt ?? new Date().toISOString(),
      branding: { ...defaultBranding(), ...parsed.branding },
      ownerName: parsed.ownerName ?? "",
      subscriptionStatus:
        parsed.subscriptionStatus === "canceled" ? "canceled" : "active",
      subscriptionId: parsed.subscriptionId ?? null,
      mailPreferences: {
        ...defaultMailPreferences(),
        ...parsed.mailPreferences,
        signature: {
          ...defaultSignatureSettings(),
          ...parsed.mailPreferences?.signature,
        },
      },
    } as OnboardingAccount;
  } catch {
    return null;
  }
}

/** Finds the mailbox whose address (username@domain) matches the given email, case-insensitively. */
export function findMailboxByEmail(
  account: OnboardingAccount,
  email: string,
): Mailbox | null {
  const normalized = email.trim().toLowerCase();
  return (
    account.mailboxes.find(
      (mailbox) =>
        `${mailbox.username}@${account.domain}`.toLowerCase() === normalized,
    ) ?? null
  );
}

const PENDING_NAME_KEY = "marrowmail.pending.ownerName";

/** Bridges the name collected at signup to the account object created later in onboarding. */
export function savePendingOwnerName(name: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PENDING_NAME_KEY, name);
}

export function consumePendingOwnerName(): string | null {
  if (typeof window === "undefined") return null;
  const name = window.localStorage.getItem(PENDING_NAME_KEY);
  window.localStorage.removeItem(PENDING_NAME_KEY);
  return name;
}

export function saveAccount(account: OnboardingAccount) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
}

export function clearAccount() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export function formatXaf(amount: number, locale: string) {
  const formatted = new Intl.NumberFormat(
    locale === "fr" ? "fr-FR" : "en-US",
  ).format(amount);
  return `${formatted} XAF`;
}

export function formatUsd(amount: number, locale: string) {
  return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function getDurationDiscount(months: number): number {
  if (months >= 12) return 0.2;
  if (months >= 6) return 0.12;
  if (months >= 3) return 0.05;
  return 0;
}

function getQuantityDiscount(count: number): number {
  if (count >= 11) return 0.15;
  if (count >= 6) return 0.1;
  if (count >= 3) return 0.05;
  return 0;
}

export interface MailboxPricing {
  perMailboxPerMonth: number;
  total: number;
  totalDiscountPercent: number;
}

// Mirrored server-side in api.marrow-mail/app/utils/pricing.ts for the real checkout charge —
// keep both in sync manually, there is no shared package between the two repos.
export function calcMailboxPricing(
  count: number,
  months: number,
  planId: PlanId = "core",
): MailboxPricing {
  const basePrice = PLANS[planId].priceXaf;
  if (count <= 0)
    return { perMailboxPerMonth: basePrice, total: 0, totalDiscountPercent: 0 };
  const durationDiscount = getDurationDiscount(months);
  const quantityDiscount = getQuantityDiscount(count);
  const combinedMultiplier = (1 - durationDiscount) * (1 - quantityDiscount);
  const perMailboxPerMonth = Math.round(basePrice * combinedMultiplier);
  const total = perMailboxPerMonth * count * months;
  const totalDiscountPercent = Math.round((1 - combinedMultiplier) * 100);
  return { perMailboxPerMonth, total, totalDiscountPercent };
}

export const STORAGE_PRICE_PER_GB_XAF = 150;

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

function hashString(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i++) {
    h = (h * 31 + value.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function createMailbox(
  username: string,
  assignedTo: string | null,
  fullName: string | null = null,
  storageGB: number = DEFAULT_MAILBOX_STORAGE_GB,
): Mailbox {
  return {
    id: makeId(),
    username,
    fullName,
    assignedTo,
    invitationStatus: assignedTo ? "pending" : "none",
    status: "active",
    storagePurchasedGB: storageGB,
    createdAt: new Date().toISOString(),
  };
}

export function createRoleAlias(alias: string, forwardsTo: string): RoleAlias {
  return {
    id: makeId(),
    alias,
    forwardsTo,
    status: "active",
    createdAt: new Date().toISOString(),
  };
}

/** Deterministic mock storage usage so it stays stable across renders without persisting fake data. */
export function getMailboxStorageUsedGB(mailbox: Mailbox): number {
  const fraction = (hashString(mailbox.id) % 85) / 100 + 0.05;
  return Math.round(mailbox.storagePurchasedGB * fraction * 10) / 10;
}

export type StorageTier = "healthy" | "warning" | "critical";

/** 80% = warning, 95% = critical, matching the storage health thresholds shown across the dashboard. */
export function getStorageTier(fraction: number): StorageTier {
  if (fraction >= 0.95) return "critical";
  if (fraction >= 0.8) return "warning";
  return "healthy";
}

export function storageTierBarClass(tier: StorageTier): string {
  if (tier === "critical") return "bg-destructive";
  if (tier === "warning") return "bg-amber-500";
  return "bg-emerald-500";
}

/** Mailboxes that should surface a storage warning/critical banner, sorted worst-first. */
export function getMailboxesNeedingStorageAttention(
  account: OnboardingAccount,
) {
  const warning: Mailbox[] = [];
  const critical: Mailbox[] = [];
  for (const mailbox of [...account.mailboxes].sort(
    (a, b) =>
      getMailboxStorageUsedGB(b) / b.storagePurchasedGB -
      getMailboxStorageUsedGB(a) / a.storagePurchasedGB,
  )) {
    const fraction =
      getMailboxStorageUsedGB(mailbox) / mailbox.storagePurchasedGB;
    const tier = getStorageTier(fraction);
    if (tier === "critical") critical.push(mailbox);
    else if (tier === "warning") warning.push(mailbox);
  }
  return { warning, critical };
}

/** Deterministic mock last-login timestamp; pending invitations have never logged in. */
export function getMailboxLastLogin(mailbox: Mailbox): string | null {
  if (mailbox.invitationStatus === "pending") return null;
  const created = new Date(mailbox.createdAt).getTime();
  const offsetHours = hashString(mailbox.id + "login") % 72;
  return new Date(created + offsetHours * 60 * 60 * 1000).toISOString();
}

export interface DnsHealth {
  spf: boolean;
  dkim: boolean;
  dmarc: boolean;
  mx: boolean;
}

export function getDnsHealth(account: OnboardingAccount): DnsHealth {
  return {
    spf: account.dnsVerified,
    dkim: account.dnsVerified,
    dmarc: account.dnsVerified,
    mx: account.dnsVerified,
  };
}

export interface DnsRecord {
  type: string;
  host: string;
  value: string;
  priority?: string;
}

/** The exact DNS records the user was told to add to their registrar during onboarding. */
export function buildDnsRecords(domain: string): DnsRecord[] {
  return [
    { type: "MX", host: "@", value: `mx1.marrowmails.com`, priority: "10" },
    { type: "TXT", host: "@", value: "v=spf1 include:marrowmails.com ~all" },
    {
      type: "TXT",
      host: "marrow._domainkey",
      value: "v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC7v9…",
    },
    {
      type: "TXT",
      host: "_dmarc",
      value: `v=DMARC1; p=quarantine; rua=mailto:dmarc@${domain}`,
    },
  ];
}

export type AiFeature = "rewrite" | "summarize" | "translate";

export interface AiFeatureUsage {
  feature: AiFeature;
  credits: number;
}

export interface AiCreditsSummary {
  remaining: number;
  totalIncluded: number;
  usedThisMonth: number;
  estimatedRemainingDays: number;
  mostUsedFeatures: AiFeatureUsage[];
}

/** Static mock — no AI features are wired up yet, this is illustrative UI-only data. */
export function getAiCreditsSummary(): AiCreditsSummary {
  return {
    remaining: 8240,
    totalIncluded: 10000,
    usedThisMonth: 1760,
    estimatedRemainingDays: 28,
    mostUsedFeatures: [
      { feature: "rewrite", credits: 850 },
      { feature: "summarize", credits: 610 },
      { feature: "translate", credits: 300 },
    ],
  };
}

export interface SubscriptionSummary {
  planId: PlanId;
  planName: string;
  monthlyCostXaf: number;
  perMailboxXaf: number;
  renewalDate: string;
  mailboxCount: number;
  workspaceStorageGB: number;
  includedAiCredits: number;
  roleAliasLimit: number;
  voiceNotesIncluded: boolean;
}

export function getSubscriptionSummary(
  account: OnboardingAccount,
): SubscriptionSummary {
  const mailboxCount = account.mailboxes.length;
  const pricing = calcMailboxPricing(mailboxCount, 1, account.plan);
  const monthlyCostXaf = pricing.total;
  const perMailboxXaf = pricing.perMailboxPerMonth;
  const workspaceStorageGB = account.mailboxes.reduce(
    (sum, m) => sum + m.storagePurchasedGB,
    0,
  );
  const renewal = new Date(account.createdAt);
  const now = new Date();
  renewal.setMonth(renewal.getMonth() + 1);
  while (renewal.getTime() < now.getTime()) {
    renewal.setMonth(renewal.getMonth() + 1);
  }
  return {
    planId: account.plan,
    planName: PLANS[account.plan].name,
    monthlyCostXaf,
    perMailboxXaf,
    renewalDate: renewal.toISOString(),
    mailboxCount,
    workspaceStorageGB,
    includedAiCredits: 10000,
    roleAliasLimit: PLANS[account.plan].roleAliasLimit,
    voiceNotesIncluded: PLANS[account.plan].voiceNotes,
  };
}

export type ActivityType =
  | "mailboxCreated"
  | "invitationAccepted"
  | "roleCreated"
  | "domainConnected"
  | "storagePurchased";

export interface ActivityEntry {
  id: string;
  type: ActivityType;
  address: string;
  date: string;
}

export function getRecentActivity(account: OnboardingAccount): ActivityEntry[] {
  const items: ActivityEntry[] = [];
  for (const m of account.mailboxes) {
    items.push({
      id: `mailbox-${m.id}`,
      type: "mailboxCreated",
      address: `${m.username}@${account.domain}`,
      date: m.createdAt,
    });
    if (m.assignedTo && m.invitationStatus === "accepted") {
      items.push({
        id: `invite-${m.id}`,
        type: "invitationAccepted",
        address: m.assignedTo,
        date: m.createdAt,
      });
    }
  }
  for (const r of account.roleAliases) {
    items.push({
      id: `role-${r.id}`,
      type: "roleCreated",
      address: `${r.alias}@${account.domain}`,
      date: r.createdAt,
    });
  }
  if (account.dnsVerified) {
    items.push({
      id: "domain-connected",
      type: "domainConnected",
      address: account.domain,
      date: account.createdAt,
    });
  }
  return items
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);
}

export interface ActivityDayGroup {
  key: string;
  entries: ActivityEntry[];
}

/** Groups already-sorted activity entries into Today / Yesterday / formatted-date buckets. */
export function groupActivityByDay(
  entries: ActivityEntry[],
  locale: string,
): ActivityDayGroup[] {
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const oneDay = 24 * 60 * 60 * 1000;
  const formatter = new Intl.DateTimeFormat(
    locale === "fr" ? "fr-FR" : "en-US",
    {
      day: "2-digit",
      month: "short",
    },
  );

  const order: string[] = [];
  const groups = new Map<string, ActivityEntry[]>();
  for (const entry of entries) {
    const time = new Date(entry.date).getTime();
    let key: string;
    if (time >= startOfToday) key = "today";
    else if (time >= startOfToday - oneDay) key = "yesterday";
    else key = formatter.format(new Date(entry.date));

    if (!groups.has(key)) {
      groups.set(key, []);
      order.push(key);
    }
    groups.get(key)!.push(entry);
  }

  return order.map((key) => ({ key, entries: groups.get(key)! }));
}

export type MailFolder =
  | "inbox"
  | "important"
  | "sent"
  | "drafts"
  | "scheduled"
  | "spam"
  | "trash";

export interface EmailAttachment {
  name: string;
  sizeKb: number;
  type: "pdf" | "image" | "doc" | "voice";
  audioDataUrl?: string;
  durationSec?: number;
  cardColor?: string;
  /** The uploaded file's real backend id, once storage upload completes. */
  fileId?: number;
  /** Download URL — only set for attachments resolved from an existing mail. */
  url?: string;
}

export interface EmailMessage {
  id: string;
  folder: MailFolder;
  fromName: string;
  fromEmail: string;
  toEmail: string;
  ccEmail?: string;
  bccEmail?: string;
  subject: string;
  preview: string;
  body: string;
  bodyHtml?: string;
  date: string;
  read: boolean;
  starred: boolean;
  folderId?: number | null;
  scheduledFor?: string;
  archived?: boolean;
  attachments?: EmailAttachment[];
  confidential?: boolean;
  importedFrom?: string;
}

/** Static, illustrative inbox — no real mail is sent or received in this prototype. */
export function generateMockMessages(
  domain: string,
  mailboxEmail: string,
): EmailMessage[] {
  const hoursAgo = (h: number) =>
    new Date(Date.now() - h * 60 * 60 * 1000).toISOString();

  return [
    {
      id: "msg-1",
      folder: "inbox",
      fromName: "MarrowMail Team",
      fromEmail: `hello@marrowmails.com`,
      toEmail: mailboxEmail,
      subject: `Welcome to your new inbox on ${domain}`,
      preview:
        "Your professional email is ready. Here are a few tips to get started...",
      body: `Hi there,\n\nYour mailbox on ${domain} is live. Here are a few things you can do next:\n\n- Set up your signature\n- Invite teammates to their own mailboxes\n- Connect a domain alias for role addresses like support@ or sales@\n\nWelcome aboard!\n\n— The MarrowMail Team`,
      date: hoursAgo(2),
      read: false,
      starred: true,
    },
    {
      id: "msg-2",
      folder: "inbox",
      fromName: "Amara Nwosu",
      fromEmail: `amara@${domain}`,
      toEmail: mailboxEmail,
      subject: "Notes from this morning's standup",
      preview:
        "Quick recap of what we covered — mostly around the Q3 rollout timeline...",
      body: `Hey,\n\nQuick recap of what we covered this morning:\n\n1. Q3 rollout is on track for the 15th\n2. Marketing needs final copy by Friday\n3. Support queue is clear\n\nLet me know if I missed anything.\n\nAmara`,
      date: hoursAgo(5),
      read: false,
      starred: false,
    },
    {
      id: "msg-3",
      folder: "inbox",
      fromName: "Billing",
      fromEmail: "billing@marrowmails.com",
      toEmail: mailboxEmail,
      subject: "Your MarrowMail invoice is ready",
      preview:
        "Your monthly invoice for the Core Plan is now available to download...",
      body: `Hello,\n\nYour monthly invoice for the Core Plan is ready. Total due: as shown on your Subscription page.\n\nThanks for using MarrowMail.`,
      date: hoursAgo(26),
      read: true,
      starred: false,
      attachments: [
        { name: "invoice-july-2026.pdf", sizeKb: 248, type: "pdf" },
      ],
    },
    {
      id: "msg-4",
      folder: "inbox",
      fromName: "Sarah Miller",
      fromEmail: "sarah@millerboutique.com",
      toEmail: mailboxEmail,
      subject: "Re: Partnership proposal",
      preview:
        "Thanks for sending this over — a couple of questions before we move forward...",
      body: `Hi,\n\nThanks for sending this over. A couple of questions before we move forward:\n\n- What's the minimum commitment?\n- Can we start with a pilot?\n\nLooking forward to hearing back.\n\nSarah`,
      date: hoursAgo(30),
      read: true,
      starred: true,
      attachments: [
        { name: "partnership-proposal.docx", sizeKb: 86, type: "doc" },
        { name: "boutique-logo.png", sizeKb: 412, type: "image" },
      ],
    },
    {
      id: "msg-5",
      folder: "inbox",
      fromName: "MarrowMail Security",
      fromEmail: "security@marrowmails.com",
      toEmail: mailboxEmail,
      subject: "Domain verification successful",
      preview: `${domain} passed all DNS checks and is fully verified.`,
      body: `Hello,\n\nGood news — ${domain} passed all DNS checks (SPF, DKIM, DMARC, MX) and is fully verified.\n\nYour mailboxes can now send and receive mail without restriction.`,
      date: hoursAgo(72),
      read: true,
      starred: false,
    },
    {
      id: "msg-6",
      folder: "sent",
      fromName: "You",
      fromEmail: mailboxEmail,
      toEmail: "sarah@millerboutique.com",
      subject: "Partnership proposal",
      preview:
        "Hi Sarah, following up on our call — here's the proposal we discussed...",
      body: `Hi Sarah,\n\nFollowing up on our call — here's the proposal we discussed. Let me know your thoughts.\n\nBest,\nYou`,
      date: hoursAgo(48),
      read: true,
      starred: false,
    },
    {
      id: "msg-7",
      folder: "drafts",
      fromName: "You",
      fromEmail: mailboxEmail,
      toEmail: "",
      subject: "(no subject)",
      preview: "Hey team, just wanted to check in on...",
      body: "Hey team, just wanted to check in on",
      date: hoursAgo(4),
      read: true,
      starred: false,
    },
  ];
}

/** Mocked historical mail carried over from another provider — no real import occurs in this prototype. */
export function generateImportedMessages(
  provider: string,
  mailboxEmail: string,
): EmailMessage[] {
  const daysAgo = (d: number) =>
    new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString();
  const slug = provider.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  const items: (Omit<
    EmailMessage,
    "id" | "folder" | "toEmail" | "read" | "starred" | "importedFrom"
  > & {
    body?: string;
  })[] = [
    {
      fromName: "Alex Chen",
      fromEmail: "alex.chen@example.com",
      subject: "Re: Project timeline",
      preview:
        "Thanks for the update — let's sync early next week to finalize...",
      body: "Thanks for the update — let's sync early next week to finalize the remaining milestones.",
      date: daysAgo(3),
    },
    {
      fromName: "Order Confirmation",
      fromEmail: "orders@shop.example.com",
      subject: "Your order has shipped",
      preview:
        "Good news! Your recent order is on its way and should arrive by...",
      body: "Good news! Your recent order is on its way and should arrive within 3-5 business days.",
      date: daysAgo(7),
    },
    {
      fromName: "Jordan Lee",
      fromEmail: "jordan.lee@example.com",
      subject: "Quick question about the proposal",
      preview: "Hey, had a quick question about the numbers on page 3...",
      body: "Hey, had a quick question about the numbers on page 3 — can we hop on a call?",
      date: daysAgo(11),
    },
    {
      fromName: "Newsletter Digest",
      fromEmail: "digest@news.example.com",
      subject: "This week's top stories",
      preview:
        "Catch up on the highlights from this week, curated just for you...",
      body: "Catch up on the highlights from this week, curated just for you.",
      date: daysAgo(15),
    },
    {
      fromName: "Priya Sharma",
      fromEmail: "priya.sharma@example.com",
      subject: "Lunch next week?",
      preview:
        "It's been a while — are you free for lunch sometime next week?...",
      body: "It's been a while — are you free for lunch sometime next week?",
      date: daysAgo(22),
    },
    {
      fromName: "Community Team",
      fromEmail: "community@example.com",
      subject: "You have 3 new notifications",
      preview: "Here's what you missed while you were away...",
      body: "Here's what you missed while you were away.",
      date: daysAgo(29),
    },
  ];

  return items.map((item, i) => ({
    id: `imported-${slug}-${i + 1}`,
    folder: "inbox",
    toEmail: mailboxEmail,
    read: true,
    starred: false,
    importedFrom: provider,
    fromName: item.fromName,
    fromEmail: item.fromEmail,
    subject: item.subject,
    preview: item.preview,
    body: item.body ?? item.preview,
    date: item.date,
  }));
}
