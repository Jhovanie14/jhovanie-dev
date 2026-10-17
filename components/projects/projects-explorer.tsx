"use client"

import { useMemo, useState, useSyncExternalStore } from "react"
import Link from "next/link"
import { IconArrowUpRight, IconLayoutGrid, IconList } from "@tabler/icons-react"
import {
  AnimatePresence,
  LayoutGroup,
  MotionConfig,
  motion,
  useMotionValue,
  useSpring,
} from "motion/react"

import { site } from "@/content/site"
import { spring } from "@/lib/motion"
import { navTransition } from "@/lib/navigation"
import { isWideCard } from "@/lib/projects"
import { cn } from "@/lib/utils"

export type ExplorerItem = {
  slug: string
  href: string
  title: string
  summary: string
  role: string
  year: number
  stack: string[]
  code: string
  line: string
  placeholder: boolean
  /** Server-rendered <ProjectCover>, sized to fill its wrapper. */
  cover: React.ReactNode
}

type View = "index" | "grid"

const ease = [0.22, 1, 0.36, 1] as const
const FROM = "/projects"

const labels = site.projectsPage

function lineStyle(item: ExplorerItem) {
  return { "--line": item.line, "--edge": item.line } as React.CSSProperties
}

// True only for a mouse or trackpad: the floating preview needs a real cursor.
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

/** Filters + view toggle above the list; everything animates between states. */
export function ProjectsExplorer({
  items,
  header,
}: {
  items: ExplorerItem[]
  header: React.ReactNode
}) {
  const [view, setView] = useState<View>("index")
  const [tech, setTech] = useState<string | null>(null)

  // Stack filters, most used first.
  const techs = useMemo(() => {
    const counts = new Map<string, number>()
    for (const item of items) for (const t of item.stack) counts.set(t, (counts.get(t) ?? 0) + 1)
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t)
  }, [items])

  const visible = tech ? items.filter((item) => item.stack.includes(tech)) : items

  return (
    <MotionConfig reducedMotion="user">
      <LayoutGroup>
        <div className="edge-light rounded-2xl border bg-card p-6 sm:p-10 lg:p-12">
          {header}

          <div className="mt-10 flex flex-col gap-4 border-t border-dashed pt-6 md:flex-row md:items-center md:justify-between">
            <Segmented
              label={labels.filterLabel}
              layoutId="filter-pill"
              value={tech ?? ""}
              onChange={(value) => setTech(value || null)}
              options={[{ value: "", label: labels.all }, ...techs.map((t) => ({ value: t, label: t }))]}
            />
            <Segmented
              label={labels.viewLabel}
              layoutId="view-pill"
              value={view}
              onChange={(value) => setView(value as View)}
              options={[
                { value: "index", label: labels.views.index, icon: <IconList aria-hidden stroke={1.75} className="size-4" /> },
                { value: "grid", label: labels.views.grid, icon: <IconLayoutGrid aria-hidden stroke={1.75} className="size-4" /> },
              ]}
            />
          </div>
        </div>

        <p aria-live="polite" className="sr-only">
          {visible.length} / {items.length}
        </p>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={visible.length === 0 ? "none" : view}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease }}
            className="mt-5"
          >
            {visible.length === 0 ? (
              <NoMatch onClear={() => setTech(null)} />
            ) : view === "index" ? (
              <IndexView items={visible} />
            ) : (
              <GridView items={visible} />
            )}
          </motion.div>
        </AnimatePresence>
      </LayoutGroup>
    </MotionConfig>
  )
}

/** Pill options with a highlight that slides to the selected one. */
function Segmented({
  label,
  layoutId,
  value,
  onChange,
  options,
}: {
  label: string
  layoutId: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string; icon?: React.ReactNode }[]
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-1">
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative isolate inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium transition-colors duration-300",
              active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                transition={spring.marker}
                className="absolute inset-0 -z-10 rounded-full bg-primary"
              />
            )}
            {option.icon}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

/* ---------------- Index: big rows + a cursor-following preview ---------------- */

function IndexView({ items }: { items: ExplorerItem[] }) {
  const [hovered, setHovered] = useState<string | null>(null)
  const finePointer = useFinePointer()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const follow = { stiffness: 320, damping: 32, mass: 0.6 }
  const sx = useSpring(x, follow)
  const sy = useSpring(y, follow)

  return (
    <div
      onPointerMove={(e) => {
        x.set(e.clientX)
        y.set(e.clientY)
      }}
      onPointerLeave={() => setHovered(null)}
    >
      <ol className="border-t">
        <AnimatePresence mode="popLayout" initial={false}>
          {items.map((item, i) => (
            <motion.li
              key={item.slug}
              layout
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, ease, delay: i * 0.06, layout: { duration: 0.5, ease } }}
              style={lineStyle(item)}
            >
              <Link
                href={item.href}
                transitionTypes={navTransition(FROM, item.href)}
                onPointerEnter={() => setHovered(item.slug)}
                onFocus={() => setHovered(item.slug)}
                onBlur={() => setHovered(null)}
                className="group relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 border-b py-6 sm:py-8 md:grid-cols-[5rem_minmax(0,1fr)_minmax(0,13rem)_3.5rem_auto]"
              >
                <span className="hidden items-center gap-2 font-mono text-xs text-muted-foreground tabular-nums md:flex">
                  <span className="size-2 rounded-full border border-(--line) transition-colors duration-300 group-hover:bg-(--line)" />
                  {item.code}
                </span>

                <span className="min-w-0">
                  <span className="block truncate text-3xl font-medium tracking-[-0.035em] transition-transform duration-500 ease-glide group-hover:translate-x-3 sm:text-4xl lg:text-5xl">
                    {item.title}
                  </span>
                  <span className="mt-2 flex items-center gap-2 font-mono text-xs text-muted-foreground md:hidden">
                    <span className="size-2 rounded-full bg-(--line)" />
                    {item.code} · {item.year}
                  </span>
                </span>

                <span className="hidden truncate text-sm text-muted-foreground md:block">{item.role}</span>
                <span className="hidden font-mono text-sm text-muted-foreground tabular-nums md:block">
                  {item.year}
                </span>

                <span
                  aria-hidden
                  className="grid size-11 place-items-center rounded-full border text-muted-foreground transition-all duration-500 ease-glide group-hover:rotate-45 group-hover:border-(--line) group-hover:bg-(--line) group-hover:text-primary-foreground"
                >
                  <IconArrowUpRight stroke={2} className="size-5" />
                </span>

                {/* The row's underline lights up in its line colour. */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 -bottom-px h-px origin-left scale-x-0 bg-(--line) transition-transform duration-700 ease-glide group-hover:scale-x-100"
                />
              </Link>
            </motion.li>
          ))}
        </AnimatePresence>
      </ol>

      {finePointer && (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed top-0 left-0 z-40 w-[22rem]"
          style={{ x: sx, y: sy }}
        >
          <motion.div
            initial={false}
            animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.85, rotate: hovered ? -2 : -6 }}
            transition={{ duration: 0.35, ease }}
            className="relative aspect-[16/10] translate-x-10 -translate-y-1/2 overflow-hidden rounded-xl border bg-card shadow-[0_30px_60px_-20px_rgb(0_0_0/0.7)]"
          >
            {items.map((item) => (
              <div
                key={item.slug}
                data-active={hovered === item.slug || undefined}
                className="absolute inset-0 opacity-0 transition-opacity duration-300 data-active:opacity-100"
                style={lineStyle(item)}
              >
                {item.cover}
              </div>
            ))}
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

/* ---------------- Grid: bento cards with a cursor spotlight ---------------- */

function GridView({ items }: { items: ExplorerItem[] }) {
  return (
    <ul className="grid gap-5 lg:grid-cols-2">
      <AnimatePresence mode="popLayout" initial={false}>
        {items.map((item, i) => (
          <GridCard key={item.slug} item={item} index={i} wide={isWideCard(i, items.length)} />
        ))}
      </AnimatePresence>
    </ul>
  )
}

function GridCard({ item, index, wide }: { item: ExplorerItem; index: number; wide: boolean }) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
      transition={{ duration: 0.6, ease, delay: index * 0.06, layout: { duration: 0.5, ease } }}
      className={cn(wide && "lg:col-span-2")}
      style={lineStyle(item)}
    >
      <Link
        href={item.href}
        transitionTypes={navTransition(FROM, item.href)}
        onPointerMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`)
          e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`)
        }}
        className={cn(
          "group edge-light relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card transition-[translate,border-color] duration-500 ease-glide hover:-translate-y-1 hover:border-(--line)/50",
          wide && "lg:flex-row"
        )}
      >
        {/* Spotlight that follows the cursor inside the card. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(26rem circle at var(--mx, 50%) var(--my, 50%), color-mix(in oklch, var(--line) 14%, transparent), transparent 65%)",
          }}
        />

        <div className={cn("relative aspect-[16/10]", wide && "lg:aspect-auto lg:min-h-[24rem] lg:w-[58%] lg:shrink-0")}>
          {item.cover}
        </div>

        <div className={cn("relative flex flex-1 flex-col p-6 sm:p-7", wide && "lg:p-10")}>
          <div className="flex items-start justify-between gap-4">
            <h3 className={cn("text-2xl font-medium tracking-[-0.03em] text-balance", wide && "lg:text-4xl")}>
              {item.title}
            </h3>
            <span
              aria-hidden
              className="grid size-10 shrink-0 place-items-center rounded-full border text-muted-foreground transition-all duration-500 ease-glide group-hover:rotate-45 group-hover:border-(--line) group-hover:bg-(--line) group-hover:text-primary-foreground"
            >
              <IconArrowUpRight stroke={2} className="size-[1.125rem]" />
            </span>
          </div>
          <p className={cn("mt-3 leading-relaxed text-muted-foreground", wide && "lg:text-lg")}>{item.summary}</p>
          <p className="mt-4 text-sm font-medium">{item.role}</p>

          <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-3 pt-8">
            <span className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground tabular-nums">
              <span aria-hidden className="size-2.5 rounded-full bg-(--line)" />
              {item.code} · {item.year}
            </span>
            {item.placeholder && (
              <span className="rounded-sm bg-warning px-1.5 py-px text-xs font-semibold text-primary-foreground">
                {site.ui.placeholder}
              </span>
            )}
            <ul className="flex flex-wrap gap-1.5" aria-label={site.ui.stack}>
              {item.stack.map((tech) => (
                <li key={tech} className="rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground">
                  {tech}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Link>
    </motion.li>
  )
}

function NoMatch({ onClear }: { onClear: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed p-10 text-center sm:p-14">
      <div aria-hidden className="mx-auto flex w-fit items-center gap-1.5">
        <span className="size-3.5 rounded-full border-[3px] border-line-1" />
        <span className="w-16 border-t-4 border-dashed border-line-1/60" />
        <span className="size-3.5 rounded-full border-[3px] border-line-1/60" />
      </div>
      <h2 className="mt-6 text-2xl font-medium tracking-[-0.02em]">{labels.noMatch.title}</h2>
      <p className="mx-auto mt-3 max-w-[44ch] leading-relaxed text-muted-foreground">{labels.noMatch.body}</p>
      <button
        type="button"
        onClick={onClear}
        className="mt-6 text-sm font-medium underline decoration-border underline-offset-4 hover:decoration-foreground"
      >
        {labels.noMatch.clear}
      </button>
    </div>
  )
}
