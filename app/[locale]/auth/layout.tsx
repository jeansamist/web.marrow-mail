import { getStaticParams } from "@/lib/i18n/server"

export function generateStaticParams() {
  return getStaticParams()
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-primary">
      <div className="flex w-full max-w-4xl gap-4 rounded-xl bg-background p-2">
        <div className="flex-1 p-4">{children}</div>
        <div className="flex min-h-120 flex-1 items-end rounded-lg bg-primary p-6 text-primary-foreground">
          <div className="">
            <h3 className="text-xl leading-normal font-bold">
              The cheapest mail service
            </h3>
            <p className="text-xs leading-normal opacity-70">
              Marrow Mail is a free email service built on top of the Marrow
              platform. It provides a simple and secure way to send and receive
              emails without any cost.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
