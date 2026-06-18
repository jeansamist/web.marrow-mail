"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
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
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { composeEmailSchema, ComposeEmailSchema } from "@/schemas/mail.schemas"
import { sendMail, uploadFiles } from "@/services/mail.services"
import type { UploadedFile } from "@/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { Editor, EditorContent, useEditor, useEditorState } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { useEffect, useRef } from "react"
import {
  Bold,
  FileText,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  List,
  ListOrdered,
  Loader2,
  Paperclip,
  PenLine,
  Quote,
  Redo2,
  Send,
  Strikethrough,
  Trash2,
  Undo2,
  X,
} from "lucide-react"
import { FunctionComponent, useState } from "react"
import { Controller, useForm } from "react-hook-form"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function fileAnchorHtml(file: UploadedFile): string {
  const sizeLabel = file.size
    ? `<span style="color:#94a3b8;font-size:12px;margin-left:6px;">${formatBytes(file.size)}</span>`
    : ""
  const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>`
  return `<a href="${file.publicUrl}" style="display:inline-flex;align-items:center;gap:7px;padding:9px 14px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:9px;text-decoration:none;color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:13px;font-weight:500;line-height:1;">${icon}${file.originalName}${sizeLabel}</a>`
}

function buildAttachmentsHtml(files: UploadedFile[]): string {
  if (files.length === 0) return ""
  return `<div style="margin-top:28px;padding-top:16px;border-top:1px solid #e2e8f0;"><p style="margin:0 0 10px 0;color:#94a3b8;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">Attachments</p><div style="display:flex;flex-wrap:wrap;gap:8px;">${files.map(fileAnchorHtml).join("")}</div></div>`
}

// ─── Toolbar ──────────────────────────────────────────────────────────────────

type ToolbarProps = { editor: Editor; disabled: boolean }

const Toolbar: FunctionComponent<ToolbarProps> = ({ editor, disabled }) => {
  const s = useEditorState({
    editor,
    selector: (ctx) => ({
      isBold: ctx.editor.isActive("bold"),
      canBold: ctx.editor.can().chain().toggleBold().run(),
      isItalic: ctx.editor.isActive("italic"),
      canItalic: ctx.editor.can().chain().toggleItalic().run(),
      isStrike: ctx.editor.isActive("strike"),
      canStrike: ctx.editor.can().chain().toggleStrike().run(),
      isH1: ctx.editor.isActive("heading", { level: 1 }),
      isH2: ctx.editor.isActive("heading", { level: 2 }),
      isH3: ctx.editor.isActive("heading", { level: 3 }),
      isBulletList: ctx.editor.isActive("bulletList"),
      isOrderedList: ctx.editor.isActive("orderedList"),
      isBlockquote: ctx.editor.isActive("blockquote"),
      canUndo: ctx.editor.can().chain().undo().run(),
      canRedo: ctx.editor.can().chain().redo().run(),
    }),
  })

  function btn(
    isActive: boolean,
    canRun: boolean,
    onClick: () => void,
    icon: React.ReactNode,
    title: string
  ) {
    return (
      <Button
        type="button"
        size="icon-sm"
        variant={isActive ? "secondary" : "ghost"}
        disabled={disabled || !canRun}
        onClick={onClick}
        title={title}
      >
        {icon}
      </Button>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b px-4 py-2">
      <div className="flex gap-0.5">
        {btn(s?.isBold ?? false, s?.canBold ?? false, () => editor.chain().focus().toggleBold().run(), <Bold />, "Bold")}
        {btn(s?.isItalic ?? false, s?.canItalic ?? false, () => editor.chain().focus().toggleItalic().run(), <Italic />, "Italic")}
        {btn(s?.isStrike ?? false, s?.canStrike ?? false, () => editor.chain().focus().toggleStrike().run(), <Strikethrough />, "Strikethrough")}
      </div>
      <Separator orientation="vertical" className="mx-1 h-4" />
      <div className="flex gap-0.5">
        {btn(s?.isH1 ?? false, true, () => editor.chain().focus().toggleHeading({ level: 1 }).run(), <Heading1 />, "Heading 1")}
        {btn(s?.isH2 ?? false, true, () => editor.chain().focus().toggleHeading({ level: 2 }).run(), <Heading2 />, "Heading 2")}
        {btn(s?.isH3 ?? false, true, () => editor.chain().focus().toggleHeading({ level: 3 }).run(), <Heading3 />, "Heading 3")}
      </div>
      <Separator orientation="vertical" className="mx-1 h-4" />
      <div className="flex gap-0.5">
        {btn(s?.isBulletList ?? false, true, () => editor.chain().focus().toggleBulletList().run(), <List />, "Bullet list")}
        {btn(s?.isOrderedList ?? false, true, () => editor.chain().focus().toggleOrderedList().run(), <ListOrdered />, "Numbered list")}
        {btn(s?.isBlockquote ?? false, true, () => editor.chain().focus().toggleBlockquote().run(), <Quote />, "Blockquote")}
      </div>
      <Separator orientation="vertical" className="mx-1 h-4" />
      <div className="flex gap-0.5">
        {btn(false, s?.canUndo ?? false, () => editor.chain().focus().undo().run(), <Undo2 />, "Undo")}
        {btn(false, s?.canRedo ?? false, () => editor.chain().focus().redo().run(), <Redo2 />, "Redo")}
      </div>
    </div>
  )
}

// ─── Types ────────────────────────────────────────────────────────────────────

type AttachmentEntry = {
  file: File
  status: "uploading" | "done" | "error"
  uploadedFile?: UploadedFile
}

// ─── Dialog ───────────────────────────────────────────────────────────────────

export const ComposeEmailDialog: FunctionComponent = () => {
  const [open, setOpen] = useState(false)
  const [attachments, setAttachments] = useState<AttachmentEntry[]>([])
  const [globalError, setGlobalError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const editorRef = useRef<Editor | null>(null)

  const form = useForm<ComposeEmailSchema>({
    resolver: zodResolver(composeEmailSchema),
    mode: "onChange",
    defaultValues: { to: "", subject: "" },
  })

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    immediatelyRender: false,
    editorProps: {
      handlePaste(_view, event) {
        const plain = event.clipboardData?.getData("text/plain") ?? ""
        const html = event.clipboardData?.getData("text/html") ?? ""
        // If clipboard already carries HTML let ProseMirror handle it
        if (html) return false
        // If plain text looks like HTML markup, parse and insert it as HTML
        if (/<[a-z][\s\S]*>/i.test(plain)) {
          event.preventDefault()
          editorRef.current?.commands.insertContent(plain)
          return true
        }
        return false
      },
    },
  })

  useEffect(() => {
    editorRef.current = editor
  }, [editor])

  const isSubmitting = form.formState.isSubmitting
  const hasUploading = attachments.some((a) => a.status === "uploading")

  function handleClose() {
    form.reset()
    editor?.commands.clearContent()
    setAttachments([])
    setGlobalError(null)
    setOpen(false)
  }

  async function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? [])
    e.target.value = ""
    const fresh = selected.filter(
      (f) => !attachments.some((a) => a.file.name + a.file.size === f.name + f.size)
    )
    if (!fresh.length) return

    setAttachments((prev) => [
      ...prev,
      ...fresh.map((file) => ({ file, status: "uploading" as const })),
    ])

    try {
      const fileData = await Promise.all(
        fresh.map(async (f) => ({
          name: f.name,
          type: f.type,
          size: f.size,
          data: new Uint8Array(await f.arrayBuffer()),
        }))
      )
      const results = await uploadFiles(fileData)
      setAttachments((prev) =>
        prev.map((a) => {
          const idx = fresh.indexOf(a.file)
          if (idx === -1) return a
          const uploadedFile = results[idx]
          return uploadedFile ? { ...a, status: "done", uploadedFile } : { ...a, status: "error" }
        })
      )
    } catch {
      setAttachments((prev) =>
        prev.map((a) => (fresh.includes(a.file) ? { ...a, status: "error" } : a))
      )
    }
  }

  function removeAttachment(index: number) {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  async function onSubmit(data: ComposeEmailSchema) {
    setGlobalError(null)
    try {
      const uploadedFiles = attachments
        .filter((a) => a.status === "done" && a.uploadedFile)
        .map((a) => a.uploadedFile!)

      let bodyHtml = editor?.getHTML() ?? ""
      if (uploadedFiles.length > 0) {
        bodyHtml += buildAttachmentsHtml(uploadedFiles)
      }

      const result = await sendMail({
        to: [data.to],
        subject: data.subject,
        bodyHtml,
      })

      if (!result) throw new Error("Send failed")

      handleClose()
    } catch {
      setGlobalError("Failed to send. Please try again.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true) }}>
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
          id="compose-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col overflow-hidden"
        >
          {/* To */}
          <fieldset className="flex items-center gap-3 border-b px-6 py-3">
            <Label
              htmlFor="compose-to"
              className="w-12 shrink-0 text-xs text-muted-foreground"
            >
              To
            </Label>
            <Controller
              control={form.control}
              name="to"
              render={({ field, fieldState }) => (
                <Input
                  id="compose-to"
                  type="email"
                  placeholder="recipient@example.com"
                  disabled={isSubmitting}
                  aria-invalid={fieldState.invalid}
                  className="border-none bg-transparent px-0 shadow-none focus-visible:ring-0"
                  {...field}
                />
              )}
            />
          </fieldset>

          {/* Subject */}
          <fieldset className="flex items-center gap-3 border-b px-6 py-3">
            <Label
              htmlFor="compose-subject"
              className="w-12 shrink-0 text-xs text-muted-foreground"
            >
              Subject
            </Label>
            <Controller
              control={form.control}
              name="subject"
              render={({ field }) => (
                <Input
                  id="compose-subject"
                  type="text"
                  placeholder="Subject"
                  disabled={isSubmitting}
                  className="border-none bg-transparent px-0 shadow-none focus-visible:ring-0"
                  {...field}
                />
              )}
            />
          </fieldset>

          {/* Toolbar */}
          {editor && <Toolbar editor={editor} disabled={isSubmitting} />}

          {/* Editor */}
          <EditorContent
            editor={editor}
            className={cn(
              "min-h-48 flex-1 overflow-auto px-6 py-4 text-sm",
              "[&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-40",
              "[&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:my-1",
              "[&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h2]:my-1",
              "[&_.ProseMirror_h3]:text-lg [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_h3]:my-1",
              "[&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-4",
              "[&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-4",
              "[&_.ProseMirror_li]:my-0.5",
              "[&_.ProseMirror_blockquote]:border-l-2 [&_.ProseMirror_blockquote]:border-muted-foreground/40 [&_.ProseMirror_blockquote]:pl-3 [&_.ProseMirror_blockquote]:text-muted-foreground",
              "[&_.ProseMirror_code]:bg-muted [&_.ProseMirror_code]:rounded [&_.ProseMirror_code]:px-1 [&_.ProseMirror_code]:font-mono [&_.ProseMirror_code]:text-xs",
              "[&_.ProseMirror_pre]:bg-muted [&_.ProseMirror_pre]:rounded-lg [&_.ProseMirror_pre]:p-3 [&_.ProseMirror_pre]:my-2 [&_.ProseMirror_pre]:font-mono [&_.ProseMirror_pre]:text-xs",
            )}
          />

          {/* Attachments */}
          {attachments.length > 0 && (
            <ul className="flex flex-wrap gap-2 border-t px-6 py-3">
              {attachments.map((entry, i) => (
                <li
                  key={i}
                  className={cn(
                    "flex max-w-48 items-center gap-2 rounded-lg border px-3 py-1.5 text-xs",
                    entry.status === "error"
                      ? "border-destructive/30 bg-destructive/5 text-destructive"
                      : "bg-muted/50"
                  )}
                >
                  {entry.status === "uploading" ? (
                    <Loader2 className="size-3.5 shrink-0 animate-spin text-muted-foreground" />
                  ) : (
                    <FileText
                      className={cn(
                        "size-3.5 shrink-0",
                        entry.status === "error"
                          ? "text-destructive"
                          : "text-muted-foreground"
                      )}
                    />
                  )}
                  <span className="truncate font-medium">{entry.file.name}</span>
                  {entry.status === "done" && (
                    <span className="shrink-0 text-muted-foreground">
                      {formatBytes(entry.file.size)}
                    </span>
                  )}
                  {entry.status === "error" && (
                    <span className="shrink-0 text-destructive">Error</span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeAttachment(i)}
                    disabled={isSubmitting}
                    className="ml-auto shrink-0 rounded-sm opacity-60 hover:opacity-100 disabled:pointer-events-none"
                  >
                    <X className="size-3" />
                    <span className="sr-only">Remove {entry.file.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Global error */}
          {globalError && (
            <div className="border-t px-6 py-3">
              <Alert variant="destructive">
                <AlertDescription>{globalError}</AlertDescription>
              </Alert>
            </div>
          )}
        </form>

        {/* Footer */}
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
            disabled={isSubmitting}
            onClick={() => fileInputRef.current?.click()}
            title="Attach files"
          >
            <Paperclip
              className={cn(
                "size-4",
                attachments.length > 0 && "text-primary"
              )}
            />
            <span className="sr-only">Attach files</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={isSubmitting}
            onClick={handleClose}
            className="text-muted-foreground hover:text-destructive"
            title="Discard"
          >
            <Trash2 className="size-4" />
            <span className="sr-only">Discard</span>
          </Button>
          <Button
            type="submit"
            form="compose-form"
            disabled={!form.formState.isValid || isSubmitting || hasUploading}
            className="ml-auto gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            {isSubmitting ? "Sending…" : hasUploading ? "Uploading…" : "Send"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
