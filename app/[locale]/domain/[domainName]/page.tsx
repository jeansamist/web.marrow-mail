import { redirect } from "next/navigation"


export default async function DomainPage({
  params,
}: {
  params: Promise<{ locale: string; domainName: string }>
}) {
  const { locale, domainName } = await params
  redirect(`/${locale}/domain/${domainName}/inbox`)
}
