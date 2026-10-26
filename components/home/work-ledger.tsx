"use client"

import { useRef, useState } from "react"
import Link from "next/link"

import { navTransition } from "@/lib/navigation"
import { cn } from "@/lib/utils"

export type LedgerRow = {
  slug: string
  href: string
  title: string
  kind: string
  year: number
  /** Server-rendered <ProjectCover>. */
  cover: React.ReactNode
}

/**
 * A plain ledger: name, kind of work, year. Pointing at or tabbing to a row
 * keeps it in full ink, softens the others, and opens that project's cover
 * beside the column, level with the row. On a phone the first three rows
 * carry their covers above them instead.
 */
export function WorkLedger({ rows }: { rows: LedgerRow[] }) {
  const [active, setActive] = useState<number | null>(null)
  const [top, setTop] = useState(0)
  const list = useRef<HTMLOListElement>(null)

  function show(i: number, row: HTMLElement) {
    setActive(i)
    setTop(row.offsetTop + row.offsetHeight / 2)
  }

  return (
    <div className="relative" onPointerLeave={() => setActive(null)}>
      <ol
        ref={list}
        className="column"
        onBlur={(e) => {
          if (!list.current?.contains(e.relatedTarget as Node)) setActive(null)
        }}
      >
        {rows.map((row, i) => (
          <li key={row.slug}>
            {i < 3 && <div className="mb-3 lg:hidden">{row.cover}</div>}
            <Link
              href={row.href}
              transitionTypes={navTransition("/", row.href)}
              onPointerEnter={(e) => show(i, e.currentTarget)}
              onFocus={(e) => show(i, e.currentTarget)}
              className={cn(
                "grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-6 py-3 transition-colors duration-200 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto]",
                active !== null && active !== i && "lg:text-muted-foreground"
              )}
            >
              <span className="font-medium">{row.title}</span>
              <span className="col-span-2 row-start-2 text-small text-muted-foreground sm:col-span-1 sm:row-start-auto">
                {row.kind}
              </span>
              <span className="col-start-2 row-start-1 text-small tabular-nums text-muted-foreground sm:col-start-auto">
                {row.year}
              </span>
            </Link>
          </li>
        ))}
      </ol>

      {/* The preview, level with the row it belongs to. */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute left-[calc(40rem+4rem)] hidden w-72 -translate-y-1/2 transition-opacity duration-150 lg:block",
          active === null ? "opacity-0" : "opacity-100"
        )}
        style={{ top }}
      >
        {active !== null && rows[active].cover}
      </div>
    </div>
  )
}
