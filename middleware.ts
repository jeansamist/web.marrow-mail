import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

// Owner-dashboard routes that require a real signed-in account (AUTH_TOKEN cookie).
// /dashboard/mail is excluded — it's a separate auth tier (mail-account JWT via
// MAIL_AUTH_TOKEN, its own /team-login/[domain] login), already gated on its own.
const PROTECTED_PREFIXES = ["/onboarding", "/dashboard"];
const EXCLUDED_PREFIXES = ["/dashboard/mail"];

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const localeMatch = pathname.match(/^\/(en|fr)(\/.*)?$/);
  const pathWithoutLocale = localeMatch ? (localeMatch[2] ?? "/") : pathname;

  const isProtected =
    PROTECTED_PREFIXES.some((prefix) => pathWithoutLocale.startsWith(prefix)) &&
    !EXCLUDED_PREFIXES.some((prefix) => pathWithoutLocale.startsWith(prefix));

  if (isProtected && !request.cookies.get("AUTH_TOKEN")) {
    const locale = localeMatch?.[1] ?? routing.defaultLocale;
    return NextResponse.redirect(new URL(`/${locale}/sign-in`, request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
