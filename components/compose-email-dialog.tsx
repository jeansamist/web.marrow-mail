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
import { FileText, Paperclip, PenLine, Send, Trash2, X } from "lucide-react"
import { FunctionComponent, useRef, useState } from "react"

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export const ComposeEmailDialog: FunctionComponent = () => {
  const [open, setOpen] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const formRef = useRef<HTMLFormElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleDiscard() {
    formRef.current?.reset()
    setAttachments([])
    setOpen(false)
  }

  function handleSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // TODO: wire up to send email service
    setAttachments([])
    setOpen(false)
  }

  function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    setAttachments((prev) => {
      const existing = new Set(prev.map((f) => f.name + f.size))
      return [...prev, ...files.filter((f) => !existing.has(f.name + f.size))]
    })
    // reset so the same file can be re-added after removal
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
              type="email"
              placeholder="recipient@example.com"
              required
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
              className="border-none bg-transparent px-0 shadow-none focus-visible:ring-0"
            />
          </fieldset>

          <Textarea
            name="body"
            placeholder="Write your message here..."
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
                    className="ml-1 shrink-0 rounded-sm text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-3" />
                    <span className="sr-only">Remove {file.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </form>

        {/* Footer — plain div to avoid DialogFooter's negative-margin assumptions */}
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
            onClick={() => fileInputRef.current?.click()}
            title="Attach files"
          >
            <Paperclip className={cn("size-4", attachments.length > 0 && "text-primary")} />
            <span className="sr-only">Attach files</span>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
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
            className="ml-auto gap-2"
          >
            <Send className="size-4" />
            Send
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
