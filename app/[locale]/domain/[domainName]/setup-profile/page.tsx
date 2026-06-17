import { SetupProfileForm } from "@/components/forms/setup-profile.form"
import { getI18n, getStaticParams } from "@/lib/i18n/server"
import { Metadata } from "next"
import Image from "next/image"
import { notFound } from "next/navigation"

export function generateStaticParams() {
  return getStaticParams()
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getI18n()
  return {
    title: t("mail.setup-profile.meta.title"),
    description: t("mail.setup-profile.meta.description"),
  }
}
export default async function page({
  params,
  searchParams,
}: {
  params: Promise<{ domainName: string }>
  searchParams: Promise<{ cuid?: string }>
}) {
  const { cuid } = await searchParams
  const { domainName } = await params
  if (!cuid) {
    notFound()
  }
  return (
    <div className="h-screen w-full bg-primary">
      <div className="mx-auto flex h-full w-full max-w-2xl flex-col gap-6 p-2 py-12">
        <Image
          src={"/Marrowmaill-Logo-White.svg"}
          alt="Marrowmail Logo"
          width={160}
          height={60}
          className="md:h-18.75 md:w-50"
        />
        <div className="relative w-full flex-1 overflow-y-auto rounded-2xl bg-background p-6">
          <SetupProfileForm cuid={cuid} domainName={domainName} />
        </div>
      </div>
    </div>
  )
}
