import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

// Owner-dashboard routes that require a real signed-in account (AUTH_TOKEN cookie).
// /dashboard/mail is excluded — it's a separate auth tier (mail-account JWT via
// MAIL_AUTH_TOKEN, its own /team-login/[domain] login), already gated on its own.
const PROTECTED_PREFIXES = ["/onboarding", "/dashboard"];
const EXCLUDED_PREFIXES = ["/dashboard/mail"];

// Owner sign-in/sign-up views (AUTH_TOKEN tier). Masked for an already signed-in
// owner — they're redirected to their workspace instead of seeing these forms again.
// Mail-account auth (/team-login/[domain], /mail-auth) is a separate tier and stays untouched.
const AUTH_PREFIXES = [
  "/sign-in",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
];

const SITE_HOST = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://marrowmails.com").hostname;
  } catch {
    return "marrowmails.com";
  }
})();

function isOwnHost(hostname: string): boolean {
  return (
    hostname === SITE_HOST ||
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".vercel.app")
  );
}

// Resolves a customer's verified custom login hostname (e.g. mail.<their-domain>)
// back to the MarrowMail domain it belongs to, via the backend's public,
// unauthenticated lookup. Returns null on any miss — unknown host, unverified,
// or a request the backend couldn't be reached for.
async function resolveCustomLoginDomain(hostname: string): Promise<string | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return null;
  try {
    const response = await fetch(
      `${apiUrl}/api/domains/by-hostname/${encodeURIComponent(hostname)}`,
    );
    if (!response.ok) return null;
    const body = await response.json();
    return typeof body?.data?.domainName === "string" ? body.data.domainName : null;
  } catch {
    return null;
  }
}

export default async function middleware(request: NextRequest) {
  const hostname = request.nextUrl.hostname;

  if (hostname && !isOwnHost(hostname)) {
    const domainName = await resolveCustomLoginDomain(hostname);
    if (domainName) {
      const url = request.nextUrl.clone();
      url.pathname = `/${routing.defaultLocale}/team-login/${encodeURIComponent(domainName)}`;
      return NextResponse.rewrite(url);
    }
    // No verified custom hostname matches — fall through to normal routing
    // unchanged, so an unrecognized host still gets the regular site.
  }

  const { pathname } = request.nextUrl;
  const localeMatch = pathname.match(/^\/(en|fr)(\/.*)?$/);
  const pathWithoutLocale = localeMatch ? (localeMatch[2] ?? "/") : pathname;
  const locale = localeMatch?.[1] ?? routing.defaultLocale;
  const isSignedIn = Boolean(request.cookies.get("AUTH_TOKEN"));

  const isProtected =
    PROTECTED_PREFIXES.some((prefix) => pathWithoutLocale.startsWith(prefix)) &&
    !EXCLUDED_PREFIXES.some((prefix) => pathWithoutLocale.startsWith(prefix));

  if (isProtected && !isSignedIn) {
    return NextResponse.redirect(new URL(`/${locale}/sign-in`, request.url));
  }

  const isAuthView = AUTH_PREFIXES.some((prefix) => pathWithoutLocale.startsWith(prefix));

  if (isAuthView && isSignedIn) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
