"use client"

import { useEffect, useState } from "react"
import { IconCheck, IconCopy } from "@tabler/icons-react"

import { site } from "@/content/site"
import { cn } from "@/lib/utils"

/**
 * One field, nothing else: the email address in the page's brightest
 * surface, with a round button inside its right end that copies it.
 * There is no form backend, so the field holds the address instead of a box.
 */
export function ContactField() {
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
    <div className="flex h-16 items-center justify-between gap-3 rounded-[var(--radius)] bg-popover pr-2 pl-5">
      <a href={`mailto:${site.email}`} className="link min-w-0 truncate text-lead">
        {site.email}
      </a>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? site.contact.copied : site.contact.copy}
        className={cn(
          "press grid size-11 shrink-0 place-items-center rounded-full bg-foreground text-background",
          copied && "bg-primary text-primary-foreground"
        )}
      >
        {copied ? (
          <IconCheck aria-hidden stroke={2} className="size-[1.125rem] animate-in zoom-in-50 duration-200" />
        ) : (
          <IconCopy aria-hidden stroke={1.75} className="size-[1.125rem]" />
        )}
      </button>
      <span aria-live="polite" className="sr-only">
        {copied ? site.contact.copied : ""}
      </span>
    </div>
  )
}
