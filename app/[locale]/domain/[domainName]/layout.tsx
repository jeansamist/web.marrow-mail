import { getStaticParams } from "@/lib/i18n/server"

export function generateStaticParams() {
  return getStaticParams()
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ domainName: string }>
}) {
  return children
}
