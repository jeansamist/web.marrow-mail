"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const avatarPalette = [
  "bg-primary/15 text-primary",
  "bg-blue-500/15 text-blue-600",
  "bg-emerald-500/15 text-emerald-600",
  "bg-violet-500/15 text-violet-600",
  "bg-rose-500/15 text-rose-600",
  "bg-amber-500/15 text-amber-600",
];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("");
}

interface Testimonial {
  quote: string;
  name: string;
  role: string;
}

export function TestimonialCarousel({ items }: { items: Testimonial[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  function scroll(direction: 1 | -1) {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector("[data-card]") as HTMLElement | null;
    const step = (card?.offsetWidth ?? 320) + 16;
    el.scrollBy({ left: direction * step, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        className="-mx-6 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-6 pb-4 [-ms-overflow-style:none] [scrollbar-width:none] sm:-mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item, i) => (
          <figure
            key={item.name}
            data-card
            className="flex w-[280px] shrink-0 snap-start flex-col gap-4 rounded-2xl border border-border bg-card p-6 transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_20px_40px_-16px_rgba(0,0,0,0.15)] active:-translate-y-1 active:border-primary/30 active:shadow-[0_20px_40px_-16px_rgba(0,0,0,0.15)] sm:w-[340px] sm:p-7"
          >
            <div className="flex gap-0.5 text-[#FBB02D]" aria-hidden>
              {Array.from({ length: 5 }).map((_, s) => (
                <Star key={s} className="size-3.5 fill-current" />
              ))}
            </div>
            <blockquote className="line-clamp-5 text-sm leading-relaxed text-foreground/85">
              &ldquo;{item.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-auto flex items-center gap-3 pt-2">
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  avatarPalette[i % avatarPalette.length],
                )}
              >
                {initials(item.name)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {item.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {item.role}
                </p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>

      <button
        type="button"
        onClick={() => scroll(-1)}
        aria-label="Previous testimonials"
        className="absolute top-1/2 -left-4 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card shadow-[0_8px_16px_-6px_rgba(0,0,0,0.2)] hover:bg-muted sm:flex"
      >
        <ChevronLeft className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => scroll(1)}
        aria-label="Next testimonials"
        className="absolute top-1/2 -right-4 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card shadow-[0_8px_16px_-6px_rgba(0,0,0,0.2)] hover:bg-muted sm:flex"
      >
        <ChevronRight className="size-4" />
      </button>
    </div>
  );
}
