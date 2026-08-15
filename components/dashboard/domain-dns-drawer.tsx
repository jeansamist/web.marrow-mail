"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Check, Copy, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDNSRecords, checkDomainStatus } from "@/services/onboarding.services";
import type { Record as DnsRecord } from "@/types";

export function DomainDnsDrawer({
  domain,
  onClose,
}: {
  domain: string;
  onClose: () => void;
}) {
  const t = useTranslations("Dashboard.domainsPage.dnsDrawer");
  const tDns = useTranslations("Onboarding.dns");
  const [records, setRecords] = useState<DnsRecord[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
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
    setVerifying(true);
    const result = await checkDomainStatus(domain);
    setVerifying(false);
    setVerified(result);
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div aria-hidden onClick={onClose} className="absolute inset-0 bg-black/30" />
      <motion.div
        initial={{ x: 32, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="relative flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-border bg-card p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">{t("title")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("description", { domain })}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("close")}
            className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" strokeWidth={1.5} />
          </button>
        </div>

        {loadingRecords ? (
          <div className="mt-6 flex items-center justify-center rounded-xl border border-border bg-background py-10">
            <Loader2 className="size-5 animate-spin text-muted-foreground" strokeWidth={1.5} />
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-xl border border-border">
            {records.map((record, i) => (
              <div
                key={record.id}
                className="grid grid-cols-[70px_1fr_auto] items-start gap-3 border-b border-border bg-background px-4 py-3 last:border-b-0"
              >
                <span className="pt-0.5 font-mono text-xs font-semibold text-foreground">
                  {record.type}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-mono text-xs text-muted-foreground">
                    {record.name}
                    {record.priority && (
                      <span className="ml-2 text-foreground/60">
                        {tDns("priority", { value: record.priority })}
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

        <Button className="mt-6 w-full" disabled={verifying} onClick={handleVerify}>
          {verifying ? (
            <>
              <Loader2 className="size-4 animate-spin" strokeWidth={1.5} />
              {tDns("checking")}
            </>
          ) : (
            tDns("verify")
          )}
        </Button>

        {verified === true && (
          <p className="mt-3 flex items-center gap-1.5 text-sm text-emerald-700">
            <Check className="size-4" strokeWidth={2} />
            {tDns("verified")}
          </p>
        )}
        {verified === false && (
          <p className="mt-3 text-sm text-amber-700">{tDns("pendingMessage")}</p>
        )}
      </motion.div>
    </div>
  );
}
