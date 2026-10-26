"use client"

import { useState, useSyncExternalStore } from "react"
import Link from "next/link"
import { IconArrowUpRight } from "@tabler/icons-react"
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react"

import { navTransition } from "@/lib/navigation"

export type WorkItem = {
  slug: string
  href: string
  index: string
  title: string
  summary: string
  outcome: string
  role: string
  year: number
  stack: string[]
  line: string
  /** Server-rendered <ProjectCover>, sized to fill its frame. */
  cover: React.ReactNode
}

type Labels = { role: string; year: string; stack: string; view: string }

const ease = [0.22, 1, 0.36, 1] as const
const FROM = "/projects"

// The cursor label needs a real pointer; touch devices just tap the cover.
function useFinePointer() {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia("(hover: hover) and (pointer: fine)")
      mql.addEventListener("change", onChange)
      return () => mql.removeEventListener("change", onChange)
    },
    () => window.matchMedia("(hover: hover) and (pointer: fine)").matches,
    () => false
  )
}

/**
 * The work index: two projects per row, the right column set lower for a
 * staggered rhythm on large screens. One column on small screens.
 */
export function WorkIndex({ items, labels }: { items: WorkItem[]; labels: Labels }) {
  return (
    <ol className="grid gap-x-8 gap-y-20 md:grid-cols-2 lg:gap-x-10 lg:gap-y-28 lg:[&>li:nth-child(even)]:mt-28">
      {items.map((item) => (
        <WorkCard key={item.slug} item={item} labels={labels} />
      ))}
    </ol>
  )
}

function WorkCard({ item, labels }: { item: WorkItem; labels: Labels }) {
  const reduceMotion = useReducedMotion()
  const finePointer = useFinePointer()
  const [hovering, setHovering] = useState(false)

  // Cursor-following "View case study" label, sprung so it trails slightly.
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 380, damping: 32, mass: 0.5 })
  const sy = useSpring(y, { stiffness: 380, damping: 32, mass: 0.5 })

  const transitionTypes = navTransition(FROM, item.href)

  return (
    <li className="group/project" style={{ "--line": item.line } as React.CSSProperties}>
      {/* Cover: wipes open from the bottom as it enters, image settles from a slight zoom. */}
      <Link
        href={item.href}
        transitionTypes={transitionTypes}
        tabIndex={-1}
        aria-hidden
        onPointerEnter={() => setHovering(true)}
        onPointerLeave={() => setHovering(false)}
        onPointerMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          x.set(e.clientX - rect.left)
          y.set(e.clientY - rect.top)
        }}
        className="relative block"
      >
        <motion.div
          initial={reduceMotion ? false : { clipPath: "inset(16% 0% 0% 0% round 0.875rem)" }}
          whileInView={{ clipPath: "inset(0% 0% 0% 0% round 0.875rem)" }}
          viewport={{ once: true, margin: "-8% 0px" }}
          transition={{ duration: 1, ease }}
          className="relative aspect-[4/3] overflow-hidden rounded-[0.875rem] bg-card ring-1 ring-border transition-shadow duration-500 group-hover/project:ring-(--line)/40"
        >
          <motion.div
            initial={reduceMotion ? false : { scale: 1.1 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true, margin: "-8% 0px" }}
            transition={{ duration: 1.3, ease }}
            className="absolute inset-0"
          >
            <div className="absolute inset-0 transition-transform duration-[900ms] ease-glide group-hover/project:scale-[1.03]">
              {item.cover}
            </div>
          </motion.div>
        </motion.div>

        {finePointer && (
          <motion.span
            aria-hidden
            className="pointer-events-none absolute top-0 left-0 z-10"
            style={{ x: sx, y: sy }}
          >
            <motion.span
              initial={false}
              animate={{ opacity: hovering ? 1 : 0, scale: hovering ? 1 : 0.6 }}
              transition={{ duration: 0.3, ease }}
              className="inline-flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full bg-foreground px-3.5 py-1.5 text-sm font-semibold whitespace-nowrap text-background shadow-lg"
            >
              {labels.view}
              <IconArrowUpRight aria-hidden stroke={2} className="size-4" />
            </motion.span>
          </motion.span>
        )}
      </Link>

      {/* Caption: index + title with the year opposite, then the story and credits. */}
      <div className="mt-6">
        <div className="flex items-baseline justify-between gap-6">
          <h2 className="flex items-baseline gap-3 text-2xl leading-tight font-semibold tracking-[-0.03em] text-balance sm:text-3xl">
            <span className="font-mono text-sm font-normal tracking-normal text-muted-foreground tabular-nums">
              {item.index}
            </span>
            <Link
              href={item.href}
              transitionTypes={transitionTypes}
              className="transition-colors duration-500 hover:text-(--line) group-hover/project:text-(--line)"
            >
              {item.title}
            </Link>
          </h2>
          <span className="shrink-0 font-mono text-sm text-muted-foreground tabular-nums">{item.year}</span>
        </div>

        <p className="mt-3 line-clamp-2 leading-relaxed text-muted-foreground">{item.summary}</p>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-foreground">{item.outcome}</p>

        <dl className="mt-5 grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-1.5 border-t pt-4 text-sm">
          <dt className="text-muted-foreground">{labels.role}</dt>
          <dd className="truncate">{item.role}</dd>
          <dt className="text-muted-foreground">{labels.stack}</dt>
          <dd className="truncate">{item.stack.join(", ")}</dd>
        </dl>
      </div>
    </li>
  )
}
