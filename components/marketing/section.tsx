import * as React from "react";
import { cn } from "@/lib/utils";

const toneStyles = {
  light: "bg-background text-foreground",
  muted: "bg-muted/40 text-foreground",
  ink: "bg-ink text-ink-foreground",
} as const;

const eyebrowToneStyles = {
  light: "text-primary",
  muted: "text-primary",
  ink: "text-ink-foreground/60",
} as const;

const descriptionToneStyles = {
  light: "text-muted-foreground",
  muted: "text-muted-foreground",
  ink: "text-ink-foreground/70",
} as const;

interface SectionProps extends Omit<React.ComponentProps<"section">, "title"> {
  id?: string;
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "center" | "left";
  tone?: keyof typeof toneStyles;
}

export function Section({
  id,
  eyebrow,
  title,
  description,
  align = "center",
  tone = "light",
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn("py-20 sm:py-28 lg:py-32", toneStyles[tone], className)}
      {...props}
    >
      <div className="container">
        <div
          className={cn(
            "flex flex-col gap-4",
            align === "center"
              ? "mx-auto max-w-2xl items-center text-center"
              : "max-w-2xl items-start text-left",
          )}
        >
          {eyebrow && (
            <span
              className={cn(
                "font-mono text-xs font-medium uppercase tracking-[0.15em]",
                eyebrowToneStyles[tone],
              )}
            >
              {eyebrow}
            </span>
          )}
          <h2 className="text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            {title}
          </h2>
          {description && (
            <p
              className={cn(
                "text-balance text-lg leading-relaxed",
                descriptionToneStyles[tone],
              )}
            >
              {description}
            </p>
          )}
        </div>

        {children && <div className="mt-16">{children}</div>}
      </div>
    </section>
  );
}
