"use client"

import { useState } from "react"
import Link from "next/link"

import { navTransition } from "@/lib/navigation"
import { cn } from "@/lib/utils"

export type WorkName = {
  slug: string
  href: string
  title: string
  role: string
  year: number
  line: string
  /** Server-rendered <ProjectCover>, sized to fill its frame. */
  cover: React.ReactNode
}

/**
 * Project names are the index. Pointing at or tabbing to a name lights it
 * and swaps the preview held beside the list; the preview follows the row,
 * never the pointer. On a phone each name carries its own cover instead.
 */
export function WorkNames({ items }: { items: WorkName[] }) {
  const [active, setActive] = useState(0)

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-6">
      <ol className="flex flex-col gap-12 lg:col-span-8 lg:gap-0">
        {items.map((item, i) => {
          const lit = i === active

          return (
            <li key={item.slug} style={{ "--line": item.line } as React.CSSProperties}>
              <Link
                href={item.href}
                transitionTypes={navTransition("/", item.href)}
                onPointerEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                data-active={lit ? "" : undefined}
                className="group block py-2.5"
              >
                <div className="mb-5 overflow-hidden rounded-2xl lg:hidden">{item.cover}</div>
                <span className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
                  <span
                    className={cn(
                      "flex items-center gap-4 text-heading font-semibold transition-colors duration-200",
                      lit ? "text-foreground" : "text-foreground lg:text-muted-foreground"
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "hidden size-3 shrink-0 rounded-full border-2 border-(--line) transition-colors duration-200 lg:block",
                        lit && "bg-(--line)"
                      )}
                    />
                    {item.title}
                  </span>
                  <span className="text-small text-muted-foreground">
                    {item.role} · {item.year}
                  </span>
                </span>
              </Link>
            </li>
          )
        })}
      </ol>

      {/* The held preview: every cover stacked, the active one shown. */}
      <div aria-hidden className="hidden lg:col-span-4 lg:block">
        <div className="sticky top-[15vh] grid aspect-[4/5] overflow-hidden rounded-2xl">
          {items.map((item, i) => (
            <div
              key={item.slug}
              style={{ "--line": item.line } as React.CSSProperties}
              data-active={i === active ? "" : undefined}
              className={cn(
                "col-start-1 row-start-1 transition-opacity duration-200",
                i === active ? "opacity-100" : "opacity-0"
              )}
            >
              {item.cover}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
