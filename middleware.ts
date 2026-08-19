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

export default function middleware(request: NextRequest) {
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
