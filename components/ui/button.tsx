import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 outline-none select-none disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-3 focus-visible:ring-ring/40 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:-translate-y-0.5 hover:bg-gradient-to-b hover:from-primary hover:to-primary-dark hover:shadow-lg hover:shadow-primary/25 active:translate-y-0 active:bg-primary/90",
        outline:
          "border border-border bg-transparent text-foreground hover:-translate-y-0.5 hover:border-primary/40 hover:bg-muted hover:shadow-md active:translate-y-0 active:bg-muted",
        ghost: "bg-transparent text-foreground hover:bg-muted active:bg-muted",
        ink: "bg-ink text-ink-foreground hover:-translate-y-0.5 hover:bg-ink/90 hover:shadow-lg hover:shadow-ink/25 active:translate-y-0 active:bg-ink/90",
      },
      size: {
        default: "h-10 px-5",
        sm: "h-9 px-4 text-sm",
        lg: "h-12 px-8 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
