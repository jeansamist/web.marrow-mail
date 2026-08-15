import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export function MobileCtaBar() {
  const t = useTranslations("MobileCta");

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 p-3 backdrop-blur-md lg:hidden">
      <Button size="lg" className="w-full" asChild>
        <Link href="/signup">{t("cta")}</Link>
      </Button>
    </div>
  );
}
