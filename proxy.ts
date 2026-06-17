import { createI18nMiddleware } from "next-international/middleware"
import { type NextRequest, NextResponse } from "next/server"

const I18nMiddleware = createI18nMiddleware({
  locales: ["en"],
  defaultLocale: "en",
  urlMappingStrategy: "redirect",
})

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.includes("/_next/") || /\.\w+$/.test(pathname)) {
    return NextResponse.next()
  }

  const token = request.cookies.get("AUTH_TOKEN")?.value

  if (token && /^\/[a-z]{2}\/auth(\/|$)/.test(pathname)) {
    const localeMatch = pathname.match(/^\/([a-z]{2})\//)
    const locale = localeMatch?.[1] ?? "en"
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}/app/dashboard`
    return NextResponse.redirect(url)
  }

  const domainInboxMatch = pathname.match(
    /^(\/[a-z]{2})\/domain\/([^/]+)\/inbox/
  )
  if (domainInboxMatch) {
    const mailToken = request.cookies.get("MAIL_AUTH_TOKEN")?.value
    if (!mailToken) {
      const [, localePath, domainName] = domainInboxMatch
      const url = request.nextUrl.clone()
      url.pathname = `${localePath}/domain/${domainName}/auth/login`
      return NextResponse.redirect(url)
    }
  }

  return I18nMiddleware(request)
}

export const proxyConfig = {
  matcher: ["/((?!_next|api|favicon\\.ico|.*\\..*).*)"],
}
