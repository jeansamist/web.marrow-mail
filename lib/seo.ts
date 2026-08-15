import { routing } from "@/i18n/routing";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://marrowmail.com";

/** Builds an `alternates.languages` map (hreflang) for a given path across every supported locale. */
export function localeAlternates(path: string) {
  const normalized = path === "/" ? "" : path;
  return Object.fromEntries(
    routing.locales.map((locale) => [locale, `${SITE_URL}/${locale}${normalized}`]),
  );
}
