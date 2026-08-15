"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Copy, LifeBuoy, Loader2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { premiumButton, softShadow } from "@/components/onboarding/styles";
import { getDNSRecords, checkDomainStatus } from "@/services/onboarding.services";
import type { Record as DnsRecord } from "@/types";

export function DnsSetupStep({
  domain,
  onVerified,
  onFinishLater,
}: {
  domain: string;
  onVerified: () => void;
  onFinishLater: () => void;
}) {
  const t = useTranslations("Onboarding.dns");
  const [records, setRecords] = useState<DnsRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "checking" | "pending" | "verified">(
    "idle",
  );
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoadingRecords(true);
    getDNSRecords(domain).then((resp) => {
      if (cancelled) return;
      setRecords(resp instanceof Error ? [] : resp);
      setLoadingRecords(false);
    });
    return () => {
      cancelled = true;
    };
  }, [domain]);

  function handleCopy(index: number, value: string) {
    navigator.clipboard?.writeText(value);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex((prev) => (prev === index ? null : prev)), 1500);
  }

  async function handleVerify() {
    setStatus("checking");
    const verified = await checkDomainStatus(domain);
    setAttempts((prev) => prev + 1);
    if (verified) {
      setStatus("verified");
      setTimeout(onVerified, 700);
    } else {
      setStatus("pending");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {t("title")}
      </h1>
      <p className="mt-2 text-muted-foreground">{t("description", { domain })}</p>

      {loadingRecords ? (
        <div className="mt-6 flex items-center justify-center rounded-xl border border-border bg-card py-10">
          <Loader2 className="size-5 animate-spin text-muted-foreground" strokeWidth={1.5} />
          <span className="ml-2.5 text-sm text-muted-foreground">{t("loadingRecords")}</span>
        </div>
      ) : (
        <div className={cn("mt-6 overflow-hidden rounded-xl border border-border", softShadow)}>
          {records.map((record, i) => (
            <div
              key={record.id}
              className="grid grid-cols-[70px_1fr_auto] items-start gap-3 border-b border-border bg-card px-4 py-3 last:border-b-0"
            >
              <span className="pt-0.5 font-mono text-xs font-semibold text-foreground">
                {record.type}
              </span>
              <div className="min-w-0">
                <p className="truncate font-mono text-xs text-muted-foreground">
                  {record.name}
                  {record.priority && (
                    <span className="ml-2 text-foreground/60">
                      {t("priority", { value: record.priority })}
                    </span>
                  )}
                </p>
                <p className="mt-0.5 truncate font-mono text-xs text-foreground">
                  {record.value}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(i, record.value)}
                className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Copy value"
              >
                {copiedIndex === i ? (
                  <Check className="size-3.5 text-primary" strokeWidth={2} />
                ) : (
                  <Copy className="size-3.5" strokeWidth={1.5} />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {status === "pending" && (
        <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-sm text-amber-700">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" strokeWidth={1.5} />
          <p>{t("pendingMessage")}</p>
        </div>
      )}

      {attempts >= 1 && (
        <details className="mt-4 rounded-xl border border-border bg-muted/20 p-3.5 text-sm [&_summary]:cursor-pointer">
          <summary className="font-medium text-foreground">{t("stillStuck")}</summary>
          <ul className="mt-2.5 flex flex-col gap-1.5 pl-4 text-muted-foreground marker:text-muted-foreground/60 list-disc">
            <li>{t("troubleshootTip1")}</li>
            <li>{t("troubleshootTip2")}</li>
            <li>{t("troubleshootTip3")}</li>
          </ul>
          <Link
            href="/assistance"
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <LifeBuoy className="size-3.5" strokeWidth={1.5} />
            {t("contactSupport")}
          </Link>
        </details>
      )}

      <Button
        size="lg"
        className={cn("mt-6 w-full", premiumButton)}
        disabled={loadingRecords || status === "checking" || status === "verified"}
        onClick={handleVerify}
      >
        {status === "checking" ? (
          <>
            <Loader2 className="size-4 animate-spin" strokeWidth={1.5} />
            {t("checking")}
          </>
        ) : status === "verified" ? (
          <>
            <Check className="size-4" strokeWidth={2} />
            {t("verified")}
          </>
        ) : (
          t("verify")
        )}
      </Button>

      <button
        type="button"
        onClick={onFinishLater}
        className="mt-3 w-full text-center text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        {t("finishLater")}
      </button>
    </div>
  );
}
