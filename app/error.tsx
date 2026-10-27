"use client"

import { useEffect } from "react"
import Link from "next/link"
import { IconRefresh } from "@tabler/icons-react"

import { site } from "@/content/site"

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  const { title, body, retry: retryLabel, home } = site.errorPage

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-24">
      <h1 className="font-heading text-[clamp(2rem,5vw,3.5rem)] leading-tight font-extrabold text-balance">{title}</h1>
      <p className="mt-4 max-w-[60ch] text-lg leading-relaxed text-muted-foreground">{body}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => retry()}
          className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground transition-transform duration-150 hover:bg-primary-hover active:scale-[0.97]"
        >
          <IconRefresh aria-hidden stroke={1.75} className="size-5" />
          {retryLabel}
        </button>
        <Link href="/" className="inline-flex h-12 items-center rounded-full border border-foreground/30 px-6 font-semibold transition-colors duration-150 hover:bg-foreground/10">
          {home}
        </Link>
      </div>
    </main>
  )
}
