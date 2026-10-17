"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { buttonVariants } from "@/components/ui/button"
import { site } from "@/content/site"
import { navTransition } from "@/lib/navigation"
import { cn } from "@/lib/utils"

const pill = "h-10 rounded-full px-4"

/** Book a call + Contact, always one click away in the shell. */
export function ShellCtas({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <div className="grid grid-cols-2 gap-2">
      <a
        href={site.bookingUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(buttonVariants(), pill)}
      >
        {site.cta.book}
      </a>
      <Link
        href="/contact"
        transitionTypes={navTransition(pathname, "/contact")}
        onNavigate={onNavigate}
        className={cn(buttonVariants({ variant: "outline" }), pill)}
      >
        {site.cta.contact}
      </Link>
    </div>
  )
}
