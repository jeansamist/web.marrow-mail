import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/brand/logo";
import {
  OrangeMoneyLogo,
  MtnMoneyLogo,
  // VisaLogo, // TEMPORARY: unused while card/Stripe payments are blocked
} from "@/components/marketing/payment-logos";

const paymentMethods = [
  { name: "Orange Money", Logo: OrangeMoneyLogo },
  { name: "MTN Money", Logo: MtnMoneyLogo },
  // TEMPORARY: card/Stripe payments are blocked for now. Uncomment to re-enable.
  // { name: "Visa", Logo: VisaLogo },
];

export function Footer() {
  const t = useTranslations("Footer");
  const columns = t.raw("columns") as {
    title: string;
    links: { label: string; href: string }[];
  }[];

  return (
    <footer className="border-t border-border bg-background">
      <div className="container pt-16 pb-24 lg:pb-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/">
              <Logo className="h-7 w-auto text-foreground" />
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              {t("tagline")}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              {paymentMethods.map(({ name, Logo }) => (
                <span key={name} title={name} className="inline-flex">
                  <Logo className="h-9 w-auto" />
                  <span className="sr-only">{name}</span>
                </span>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="font-mono text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
                {col.title}
              </h3>
              <ul className="mt-4 flex flex-col gap-2.5">
                {col.links.map((link) =>
                  link.href.startsWith("/") ? (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ) : (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        {link.label}
                      </a>
                    </li>
                  ),
                )}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-16 border-t border-border pt-8 text-xs text-muted-foreground">
          {t("copyright", { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  );
}
