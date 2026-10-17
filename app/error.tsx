"use client"

import { useEffect } from "react"
import Link from "next/link"
import { IconRefresh } from "@tabler/icons-react"

import { buttonVariants, Button } from "@/components/ui/button"
import { site } from "@/content/site"
import { cn } from "@/lib/utils"

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
    <div className="mx-auto w-full max-w-5xl px-6 py-16 md:px-10 lg:px-16 lg:py-24">
      <div className="flex items-center gap-3" aria-hidden>
        <span className="size-4 rounded-full border-[3px] border-warning" />
        <span className="w-24 border-t-4 border-dashed border-warning" />
      </div>
      <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">{title}</h1>
      <p className="mt-4 max-w-[60ch] text-lg leading-relaxed text-muted-foreground">{body}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button size="lg" className="h-11 gap-2 px-5" onClick={() => retry()}>
          <IconRefresh aria-hidden stroke={1.75} />
          {retryLabel}
        </Button>
        <Link
          href="/"
          transitionTypes={["nav-back"]}
          className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 px-5")}
        >
          {home}
        </Link>
      </div>
    </div>
  )
}
