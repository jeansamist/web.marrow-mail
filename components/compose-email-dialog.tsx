"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { createUploadLinks, sendMail } from "@/services/mail.services"
import type { UploadedFile } from "@/types"
import { FileText, Loader2, Paperclip, PenLine, Send, Trash2, X } from "lucide-react"
import { FunctionComponent, useRef, useState } from "react"

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function buildEmailHtml(bodyText: string, files: UploadedFile[]): string {
  const paragraphs = bodyText
    .split("\n")
    .map((line) =>
      line.trim()
        ? `<p style="margin:0 0 12px 0;">${line}</p>`
        : `<br />`
    )
    .join("")

  const attachmentsHtml =
    files.length > 0
      ? `<div style="margin-top:28px;padding-top:16px;border-top:1px solid #e2e8f0;">
  <p style="margin:0 0 10px 0;color:#94a3b8;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Attachments</p>
  <div style="display:flex;flex-wrap:wrap;gap:8px;">
    ${files.map((f) => fileAnchorHtml(f)).join("")}
  </div>
</div>`
      : ""

  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.7;color:#0f172a;">${paragraphs}${attachmentsHtml}</div>`
}

function fileAnchorHtml(file: UploadedFile): string {
  const sizeLabel = file.size
    ? `<span style="color:#94a3b8;font-size:12px;margin-left:6px;">${formatBytes(file.size)}</span>`
    : ""
  const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>`
  return `<a href="${file.publicUrl}" style="display:inline-flex;align-items:center;gap:7px;padding:9px 14px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:9px;text-decoration:none;color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:13px;font-weight:500;line-height:1;">${icon}${file.originalName}${sizeLabel}</a>`
}

export const ComposeEmailDialog: FunctionComponent = () => {
  const [open, setOpen] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleDiscard() {
    formRef.current?.reset()
    setAttachments([])
    setError(null)
    setOpen(false)
  }

  async function handleSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSending(true)
    setError(null)

    try {
      const formData = new FormData(e.currentTarget)
      const to = formData.get("to") as string
      const subject = (formData.get("subject") as string) || ""
      const bodyText = (formData.get("body") as string) || ""

      // Request presigned upload URLs, then PUT each file directly to S3
      let uploadedFiles: UploadedFile[] = []
      if (attachments.length > 0) {
        const links = await createUploadLinks(
          attachments.map((f) => ({
            originalName: f.name,
            mimeType: f.type || undefined,
            size: f.size,
          }))
        )

        await Promise.all(
          links.map(({ uploadUrl }, i) =>
            fetch(uploadUrl, {
              method: "PUT",
              body: attachments[i],
              headers: {
                "Content-Type":
                  attachments[i].type || "application/octet-stream",
              },
            })
          )
        )

        uploadedFiles = links.map((l) => l.file)
      }

      const bodyHtml = buildEmailHtml(bodyText, uploadedFiles)

      await sendMail({
        to: [to],
        subject,
        bodyHtml,
        bodyText,
      })

      formRef.current?.reset()
      setAttachments([])
      setOpen(false)
    } catch {
      setError("Failed to send. Please try again.")
    } finally {
      setIsSending(false)
    }
  }

  function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    setAttachments((prev) => {
      const existing = new Set(prev.map((f) => f.name + f.size))
      return [...prev, ...files.filter((f) => !existing.has(f.name + f.size))]
    })
    e.target.value = ""
  }

  function removeAttachment(index: number) {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full gap-2">
          <PenLine className="size-4" />
          Compose
        </Button>
      </DialogTrigger>

      <DialogContent className="flex flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>New message</DialogTitle>
        </DialogHeader>

        <form
          ref={formRef}
          id="compose-email-form"
          onSubmit={handleSend}
          className="flex flex-col"
        >
          <fieldset className="flex items-center gap-3 border-b px-6 py-3">
            <Label
              htmlFor="compose-to"
              className="w-12 shrink-0 text-xs text-muted-foreground"
            >
              To
            </Label>
            <Input
              id="compose-to"
              name="to"
              type="email"
              placeholder="recipient@example.com"
              required
              disabled={isSending}
              className="border-none bg-transparent px-0 shadow-none focus-visible:ring-0"
            />
          </fieldset>

          <fieldset className="flex items-center gap-3 border-b px-6 py-3">
            <Label
              htmlFor="compose-subject"
              className="w-12 shrink-0 text-xs text-muted-foreground"
            >
              Subject
            </Label>
            <Input
              id="compose-subject"
              name="subject"
              type="text"
              placeholder="Subject"
              disabled={isSending}
              className="border-none bg-transparent px-0 shadow-none focus-visible:ring-0"
            />
          </fieldset>

          <Textarea
            name="body"
            placeholder="Write your message here..."
            disabled={isSending}
            className="min-h-56 resize-none rounded-none border-none bg-transparent px-6 py-4 shadow-none focus-visible:ring-0"
          />

          {attachments.length > 0 && (
            <ul className="flex flex-wrap gap-2 border-t px-6 py-3">
              {attachments.map((file, i) => (
                <li
                  key={i}
                  className="flex max-w-48 items-center gap-2 rounded-lg border bg-muted/50 px-3 py-1.5 text-xs"
                >
                  <FileText className="size-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate font-medium">{file.name}</span>
                  <span className="shrink-0 text-muted-foreground">
                    {formatBytes(file.size)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(i)}
                    disabled={isSending}
                    className="ml-1 shrink-0 rounded-sm text-muted-foreground hover:text-foreground disabled:pointer-events-none"
                  >
                    <X className="size-3" />
                    <span className="sr-only">Remove {file.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {error && (
            <p className="border-t px-6 py-2 text-xs text-destructive">
              {error}
            </p>
          )}
        </form>

        <div className="flex items-center gap-2 border-t px-4 py-3">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="sr-only"
            onChange={handleFilesChange}
            tabIndex={-1}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={isSending}
            onClick={() => fileInputRef.current?.click()}
            title="Attach files"
          >
            <Paperclip
              className={cn("size-4", attachments.length > 0 && "text-primary")}
            />
            <span className="sr-only">Attach files</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={isSending}
            onClick={handleDiscard}
            className="text-muted-foreground hover:text-destructive"
            title="Discard"
          >
            <Trash2 className="size-4" />
            <span className="sr-only">Discard</span>
          </Button>
          <Button
            type="submit"
            form="compose-email-form"
            disabled={isSending}
            className="ml-auto gap-2"
          >
            {isSending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            {isSending ? "Sending…" : "Send"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
