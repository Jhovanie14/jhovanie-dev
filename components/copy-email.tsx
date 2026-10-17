"use client"

import { useEffect, useState } from "react"
import { IconCheck, IconCopy } from "@tabler/icons-react"

import { site } from "@/content/site"
import { cn } from "@/lib/utils"

/** Copies the email address; falls back to the mailto link if the clipboard is unavailable. */
export function CopyEmail({ className }: { className?: string }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const id = setTimeout(() => setCopied(false), 1800)
    return () => clearTimeout(id)
  }, [copied])

  async function copy() {
    try {
      await navigator.clipboard.writeText(site.email)
      setCopied(true)
    } catch {
      window.location.href = `mailto:${site.email}`
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? site.ui.copied : site.ui.copyEmail}
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-full border text-muted-foreground transition-colors duration-300 hover:text-foreground",
        copied && "border-line-2/60 text-line-2 hover:text-line-2",
        className
      )}
    >
      {copied ? (
        <IconCheck aria-hidden stroke={2} className="size-4 animate-in zoom-in-50 duration-200" />
      ) : (
        <IconCopy aria-hidden stroke={1.75} className="size-4" />
      )}
      <span aria-live="polite" className="sr-only">
        {copied ? site.ui.copied : ""}
      </span>
    </button>
  )
}
