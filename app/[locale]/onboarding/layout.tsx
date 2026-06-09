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
    <main className="flex h-screen justify-center bg-primary p-2">
      <div className="flex-1 rounded-lg bg-background p-4 py-36">
        <div className="mx-auto max-w-3xl">{children}</div>
      </div>
      <div className="flex max-w-lg flex-col justify-end gap-4 rounded-lg bg-primary text-primary-foreground">
        <div className="px-6">
          <h3 className="text-2xl leading-normal font-bold">
            Setup everythings
          </h3>
          <p className="text-sm leading-normal opacity-70">
            Register your domain, create your email address, and start sending
            emails in minutes with Marrow Mail. Our user-friendly interface and
            comprehensive documentation make it easy to get started, even if
            you&apos;re new to email hosting.
          </p>
        </div>
        <div className="space-y-2 px-2">
          <div className="flex cursor-pointer items-center gap-4 rounded-xl bg-transparent p-4 transition-colors hover:bg-primary-foreground/10">
            <span className="flex size-10 items-center justify-center rounded-full border border-primary-foreground bg-primary-foreground/10 font-bold">
              1
            </span>
            <div>
              <h3 className="text-lg leading-normal font-semibold">
                Register a domain
              </h3>
              <p className="text-xs leading-normal opacity-70">
                Add your own domain or buy a new one
              </p>
            </div>
          </div>
          <div className="flex cursor-pointer items-center gap-4 rounded-xl bg-transparent p-4 transition-colors hover:bg-primary-foreground/10">
            <span className="flex size-10 items-center justify-center rounded-full border border-primary-foreground bg-primary-foreground/10 font-bold">
              2
            </span>
            <div>
              <h3 className="text-lg leading-normal font-semibold">
                Configure DNS
              </h3>
              <p className="text-xs leading-normal opacity-70">
                Add the provided DNS records to your domain
              </p>
            </div>
          </div>
          <div className="flex cursor-pointer items-center gap-4 rounded-xl bg-transparent p-4 transition-colors hover:bg-primary-foreground/10">
            <span className="flex size-10 items-center justify-center rounded-full border border-primary-foreground bg-primary-foreground/10 font-bold">
              3
            </span>
            <div>
              <h3 className="text-lg leading-normal font-semibold">
                Create email address
              </h3>
              <p className="text-xs leading-normal opacity-70">
                Create your email address and start sending emails
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
