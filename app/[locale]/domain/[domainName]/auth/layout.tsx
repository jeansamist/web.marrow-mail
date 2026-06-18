import Image from "next/image"


export default async function DomainAuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-primary p-4">
      <div className="w-full max-w-4xl space-y-6">
        <Image
          src={"/Marrowmaill-Logo-White.svg"}
          alt="Marrowmail Logo"
          width={160}
          height={60}
          className="md:w-50 md:h-18.75"
        />
        <div className="flex w-full flex-col items-stretch gap-4 rounded-xl bg-background p-2 md:flex-row md:items-center">
          <div className="flex-1 p-4">{children}</div>
          <div className="relative hidden min-h-120 flex-1 items-end gap-6 rounded-lg bg-primary p-6 text-primary-foreground md:flex">
            <div className="space-y-4">
              <Image
                src={"/M-White.svg"}
                alt="M White"
                width={80}
                height={80}
              />
              <div>
                <h3 className="text-xl leading-normal font-bold">
                  Your mailbox, secured
                </h3>
                <p className="text-xs leading-normal opacity-70">
                  Marrow Mail keeps your communications private and accessible.
                  Sign in to manage your inbox, send messages, and stay
                  connected.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
