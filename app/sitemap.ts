import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { SITE_URL, localeAlternates } from "@/lib/seo";

const ROUTES: { path: string; priority: number; changeFrequency: "weekly" | "monthly" }[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/signup", priority: 0.8, changeFrequency: "monthly" },
  { path: "/sign-in", priority: 0.6, changeFrequency: "monthly" },
  { path: "/assistance", priority: 0.5, changeFrequency: "monthly" },
  { path: "/terms", priority: 0.3, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "monthly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.flatMap(({ path, priority, changeFrequency }) =>
    routing.locales.map((locale) => ({
      url: `${SITE_URL}/${locale}${path === "/" ? "" : path}`,
      lastModified: new Date(),
      changeFrequency,
      priority,
      alternates: {
        languages: localeAlternates(path),
      },
    })),
  );
}
