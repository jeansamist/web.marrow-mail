"use client"

import { createI18nClient } from "next-international/client"

export const {
  useI18n,
  useScopedI18n,
  I18nProviderClient,
  useChangeLocale,
  useCurrentLocale,
} = createI18nClient({
  en: () => import("../../locales/en"),
})

// Hook to build an URL based on the current locale
export const useCurrentLocaleUrl = () => {
  const currentLocale = useCurrentLocale()
  return { currentLocaleUrl: (path: string) => `/${currentLocale}${path}` }
}
