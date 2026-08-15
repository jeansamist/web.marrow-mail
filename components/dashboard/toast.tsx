"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { motion } from "motion/react";
import { CheckCircle2, Info, TriangleAlert, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "info" | "warning" | "error";

interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
}

const ToastContext = createContext<{
  show: (message: string, variant?: ToastVariant) => void;
} | null>(null);

const variantStyles: Record<
  ToastVariant,
  { icon: typeof CheckCircle2; className: string }
> = {
  success: {
    icon: CheckCircle2,
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
  },
  info: {
    icon: Info,
    className: "border-blue-500/30 bg-blue-500/10 text-blue-700",
  },
  warning: {
    icon: TriangleAlert,
    className: "border-amber-500/30 bg-amber-500/10 text-amber-700",
  },
  error: {
    icon: XCircle,
    className: "border-red-500/30 bg-red-500/10 text-red-700",
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const show = useCallback((message: string, variant: ToastVariant = "success") => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="pointer-events-none fixed right-4 bottom-4 z-50 flex flex-col gap-2 sm:right-6 sm:bottom-6">
        {toasts.map((toast) => {
          const { icon: Icon, className } = variantStyles[toast.variant];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "pointer-events-auto flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium shadow-lg",
                className,
              )}
            >
              <Icon className="size-4 shrink-0" strokeWidth={1.5} />
              {toast.message}
            </motion.div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
