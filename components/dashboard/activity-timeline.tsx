import type { LucideIcon } from "lucide-react";

export interface TimelineItem {
  id: string;
  icon: LucideIcon;
  text: string;
  time: string;
}

export interface TimelineGroup {
  label: string;
  items: TimelineItem[];
}

export function ActivityTimeline({ groups }: { groups: TimelineGroup[] }) {
  return (
    <div className="flex flex-col gap-7">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {group.label}
          </p>
          <ul className="mt-3 divide-y divide-border/70">
            {group.items.map((item) => (
              <li key={item.id} className="flex items-center gap-3.5 py-3.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <item.icon className="size-4" strokeWidth={1.5} />
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground/90">
                  {item.text}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {item.time}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
