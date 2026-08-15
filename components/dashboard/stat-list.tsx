import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatListItem {
  icon: LucideIcon;
  label: string;
  value: string | number;
  tone?: "primary" | "ai";
}

export function StatList({ items }: { items: StatListItem[] }) {
  return (
    <div className="divide-y divide-border/60">
      {items.map((item, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
        >
          <div className="flex items-center gap-3.5">
            <span
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-xl",
                item.tone === "ai"
                  ? "bg-ai-accent/10 text-ai-accent"
                  : "bg-primary/10 text-primary",
              )}
            >
              <item.icon className="size-5" strokeWidth={1.5} />
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              {item.label}
            </span>
          </div>
          <span className="shrink-0 text-2xl font-semibold tabular-nums text-foreground">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}
