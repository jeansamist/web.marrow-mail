"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { cardShadow } from "@/components/onboarding/styles";
import { Logo } from "@/components/brand/logo";

const stepVariants = {
  enter: (direction: number) => ({ opacity: 0, x: direction > 0 ? 20 : -20 }),
  center: { opacity: 1, x: 0 },
};

export function OnboardingShell({
  stepKey,
  stepIndex,
  totalSteps,
  onBack,
  exitHref,
  children,
}: {
  stepKey: string;
  stepIndex: number;
  totalSteps: number;
  onBack?: () => void;
  exitHref: string;
  children: ReactNode;
}) {
  const t = useTranslations("Onboarding");
  const progress = Math.round(((stepIndex + 1) / totalSteps) * 100);

  const prevIndexRef = useRef(stepIndex);
  const direction = stepIndex >= prevIndexRef.current ? 1 : -1;
  useEffect(() => {
    prevIndexRef.current = stepIndex;
  }, [stepIndex]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-muted/50 to-background">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-24 -right-24 size-96 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute top-1/2 -left-24 size-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 size-72 rounded-full bg-accent-foreground/5 blur-3xl" />
      </div>

      <header className="border-b border-border/70 bg-background/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              aria-label={t("back")}
              className="inline-flex items-center justify-center rounded-full p-2 text-muted-foreground transition-colors duration-200 hover:bg-primary/10 hover:text-primary"
            >
              <ArrowLeft className="size-5" strokeWidth={1.5} />
            </button>
          ) : (
            <Link
              href={exitHref}
              aria-label={t("back")}
              className="inline-flex items-center justify-center rounded-full p-2 text-muted-foreground transition-colors duration-200 hover:bg-primary/10 hover:text-primary"
            >
              <ArrowLeft className="size-5" strokeWidth={1.5} />
            </Link>
          )}
          <Link href="/">
            <Logo className="h-7 w-auto text-foreground" />
          </Link>
          <div className="flex flex-col items-end gap-1.5">
            <span className="font-mono text-xs text-muted-foreground">
              {t("stepLabel", { current: stepIndex + 1, total: totalSteps })}
            </span>
            <div className="h-1.5 w-28 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="container flex min-h-[calc(100vh-65px)] items-center justify-center py-12">
        <div className={cn("w-full max-w-xl")}>
          <motion.div
            key={stepKey}
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className={cn(
              "rounded-2xl border border-border bg-card p-8 sm:p-10",
              cardShadow,
            )}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
