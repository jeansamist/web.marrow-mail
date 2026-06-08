import { Button } from "@/components/ui/button"
import { getI18n } from "@/lib/i18n/server"

export default async function Page() {
  const t = await getI18n()

  return (
    <div className="flex min-h-svh p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <h1 className="font-medium">{t("home.ready.title")}</h1>
          <p>{t("home.ready.description")}</p>
          <p>{t("home.ready.button-hint")}</p>
          <Button className="mt-2">{t("home.ready.button")}</Button>
        </div>
        <div className="font-mono text-xs text-muted-foreground">
          {t("home.dark-mode-hint")}
        </div>
      </div>
    </div>
  )
}
