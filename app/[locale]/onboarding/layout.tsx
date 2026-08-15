import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ToastProvider } from "@/components/dashboard/toast";

export const metadata: Metadata = {
  title: "Set up your workspace",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
