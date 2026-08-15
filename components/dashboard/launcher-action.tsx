import type { LucideIcon } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const TONE_CLASSES = {
  primary: "bg-primary/10 text-primary group-hover:bg-primary/20",
  emerald: "bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-500/20",
  blue: "bg-blue-500/10 text-blue-600 group-hover:bg-blue-500/20",
  ai: "bg-ai-accent/10 text-ai-accent group-hover:bg-ai-accent/20",
  amber: "bg-amber-500/10 text-amber-600 group-hover:bg-amber-500/20",
} as const;

const BORDER_TONE_CLASSES = {
  primary: "hover:border-primary/50",
  emerald: "hover:border-emerald-500/50",
  blue: "hover:border-blue-500/50",
  ai: "hover:border-ai-accent/50",
  amber: "hover:border-amber-500/50",
} as const;

export function LauncherAction({
  icon: Icon,
  label,
  description,
  href,
  tone = "primary",
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  description: string;
  href?: string;
  tone?: keyof typeof TONE_CLASSES;
  onClick?: () => void;
}) {
  const className = cn(
    "group flex flex-1 cursor-pointer flex-col gap-4 rounded-2xl border border-border/60 bg-card p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_20px_36px_-20px_rgba(0,0,0,0.2)] sm:p-6",
    BORDER_TONE_CLASSES[tone],
  );
  const inner = (
    <>
      <span
        className={cn(
          "flex size-12 shrink-0 items-center justify-center rounded-xl transition-colors duration-200",
          TONE_CLASSES[tone],
        )}
      >
        <Icon className="size-6" strokeWidth={1.5} />
      </span>
      <div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {inner}
    </button>
  );
}
