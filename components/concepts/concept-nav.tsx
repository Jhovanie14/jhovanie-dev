"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { concepts } from "@/lib/concepts"
import { cn } from "@/lib/utils"

/**
 * The review switcher, not part of any design: a plain white strip that stays
 * the same on every concept so the concepts can be compared side by side.
 */
export function ConceptNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Design concepts"
      className="fixed inset-x-0 top-0 z-[100] flex h-11 items-center gap-1 overflow-x-auto bg-white px-3 text-[13px] text-neutral-900 [scrollbar-width:none]"
    >
      <Link href="/concepts" className="mr-2 shrink-0 rounded px-2 py-1 font-semibold hover:bg-neutral-100">
        Concepts
      </Link>
      {concepts.map((concept) => {
        const href = `/concepts/${concept.slug}`
        const active = pathname === href

        return (
          <Link
            key={concept.slug}
            href={href}
            aria-current={active ? "page" : undefined}
            title={concept.thesis}
            className={cn(
              "shrink-0 rounded px-2.5 py-1 hover:bg-neutral-100",
              active ? "bg-neutral-900 text-white hover:bg-neutral-900" : "text-neutral-600"
            )}
          >
            {concept.name}
          </Link>
        )
      })}
      <Link href="/" className="ml-auto shrink-0 rounded px-2 py-1 text-neutral-600 hover:bg-neutral-100">
        Current site
      </Link>
    </nav>
  )
}
