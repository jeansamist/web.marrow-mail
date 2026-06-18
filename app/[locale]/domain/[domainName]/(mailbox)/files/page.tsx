import { setStaticParamsLocale } from "@/lib/i18n/server"
import { getFiles } from "@/services/mail.services"
import type { UploadedFile } from "@/types"
import { FileText, Paperclip } from "lucide-react"
import { Metadata } from "next"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  setStaticParamsLocale(locale)
  return { title: "Files" }
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86_400_000)
  if (diffDays === 0) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return date.toLocaleDateString([], { weekday: "short" })
  return date.toLocaleDateString([], { month: "short", day: "numeric" })
}

function FileCard({ file }: { file: UploadedFile }) {
  return (
    <a
      href={file.publicUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 rounded-xl border bg-background px-4 py-3 text-sm transition-colors hover:bg-accent"
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
        <FileText className="size-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{file.originalName}</p>
        <p className="text-xs text-muted-foreground">
          {file.mimeType ?? "Unknown type"}
          {file.size ? ` · ${formatBytes(file.size)}` : ""}
        </p>
      </div>
      <span className="shrink-0 text-xs text-muted-foreground">{formatDate(file.createdAt)}</span>
    </a>
  )
}

export default async function FilesPage({
  params,
}: {
  params: Promise<{ locale: string; domainName: string }>
}) {
  const { locale } = await params
  setStaticParamsLocale(locale)

  const files = await getFiles()

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-2xl bg-background">
      <div className="border-b px-6 py-4">
        <h1 className="text-base font-semibold">Files</h1>
        <p className="text-xs text-muted-foreground">{files.length} uploaded file{files.length !== 1 ? "s" : ""}</p>
      </div>

      {files.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <Paperclip className="size-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium">No files yet</p>
            <p className="text-xs text-muted-foreground">Files attached to emails will appear here</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto p-4">
          <div className="flex flex-col gap-2">
            {files.map((file) => (
              <FileCard key={file.id} file={file} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
