import { useTranslations } from "next-intl";
import { TriangleAlert } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getMailboxStorageUsedGB, type Mailbox } from "@/lib/onboarding";

export function StorageWarningBanner({
  mailbox,
  domain,
  tier,
}: {
  mailbox: Mailbox;
  domain: string;
  tier: "warning" | "critical";
}) {
  const t = useTranslations("Dashboard.storageWarning");
  const tStorage = useTranslations("Dashboard.storagePage");
  const usedGB = getMailboxStorageUsedGB(mailbox);
  const percent = Math.round((usedGB / mailbox.storagePurchasedGB) * 100);
  const email = `${mailbox.username}@${domain}`;
  const critical = tier === "critical";

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-2xl p-4",
        critical
          ? "border border-destructive/30 bg-destructive/10"
          : "border border-amber-500/30 bg-amber-500/10",
      )}
    >
      <TriangleAlert
        className={cn(
          "mt-0.5 size-5 shrink-0",
          critical ? "text-destructive" : "text-amber-700",
        )}
        strokeWidth={1.5}
      />
      <p
        className={cn(
          "flex-1 text-sm font-medium",
          critical ? "text-destructive" : "text-amber-900",
        )}
      >
        {critical
          ? t("criticalMessage", { email, percent, total: mailbox.storagePurchasedGB })
          : t("warningMessage", { email, percent, total: mailbox.storagePurchasedGB })}
      </p>
      <Button size="sm" variant={critical ? "default" : "outline"} className="shrink-0" asChild>
        <Link href="/dashboard/mailboxes">{tStorage("buyMore")}</Link>
      </Button>
    </div>
  );
}
