"use client"

import { useEffect, useRef, useState } from "react"
import { IconChevronDown } from "@tabler/icons-react"

import { site } from "@/content/site"
import { ease, gsap, reducedMotion } from "@/lib/motion"
import { cn } from "@/lib/utils"

type Result =
  | { phase: "idle" }
  | { phase: "sending" }
  | { phase: "done"; status: number; ms: number; body: string }
  | { phase: "error"; message: string }

// The request path, outermost first: only skill groups that sit on it.
const path = site.skills.filter((group) => group.layer)

/** The packet walks down the layers (request) and back up (response). */
function walk(root: HTMLElement) {
  const rail = root.querySelector<HTMLElement>("[data-rail]")
  const packet = root.querySelector<HTMLElement>("[data-packet]")
  const dots = gsap.utils.toArray<HTMLElement>("[data-dot]", root)
  const tl = gsap.timeline()
  if (!rail || !packet || dots.length === 0) return tl

  const top = rail.getBoundingClientRect().top
  const at = (dot: HTMLElement) => {
    const r = dot.getBoundingClientRect()
    return r.top + r.height / 2 - top
  }

  gsap.set(dots, { clearProps: "backgroundColor,borderColor" })
  tl.set(packet, { y: at(dots[0]), autoAlpha: 1 })
  dots.forEach((dot, i) => {
    if (i > 0) tl.to(packet, { y: at(dot), duration: 0.22, ease: ease.inOut })
    tl.to(dot, { backgroundColor: "var(--foreground)", borderColor: "var(--foreground)", duration: 0.12 }, "<0.1")
  })
  tl.to(packet, { y: at(dots[0]), duration: 0.5, ease: ease.inOut, delay: 0.08 })
  tl.to(packet, { autoAlpha: 0, duration: 0.2 })
  return tl
}

/**
 * The hero instrument (DESIGN.md §6): a real GET to this site's own API,
 * drawn as it travels the stack I build, edge to data and back. The status,
 * body and time are what the browser measured; the walk down the layers is
 * the diagram of where that request goes. Each layer opens to say what I do
 * there. Sends itself once when it first comes into view.
 */
export function Trace({ className }: { className?: string }) {
  const { method, path: url, send, resend, sending, measured } = site.trace
  const [result, setResult] = useState<Result>({ phase: "idle" })
  const [open, setOpen] = useState<string | null>(null)
  const scope = useRef<HTMLElement>(null)
  const busy = useRef(false)

  const timeline = useRef<gsap.core.Timeline | null>(null)
  useEffect(() => () => void timeline.current?.kill(), [])

  async function run() {
    if (busy.current) return
    busy.current = true
    setResult({ phase: "sending" })

    let animation: Promise<unknown> = Promise.resolve()
    if (scope.current && !window.matchMedia(reducedMotion).matches) {
      timeline.current?.kill()
      timeline.current = walk(scope.current)
      animation = timeline.current.then()
    }
    const start = performance.now()
    let next: Result
    try {
      const response = await fetch(url, { cache: "no-store" })
      const ms = Math.round(performance.now() - start)
      next = { phase: "done", status: response.status, ms, body: JSON.stringify(await response.json(), null, 2) }
    } catch {
      next = { phase: "error", message: "Network error: the request didn't reach the server." }
    }
    await animation
    setResult(next)
    busy.current = false
  }

  // Send once when the instrument first comes into view, so the first look already shows it working.
  const fired = useRef(false)
  useEffect(() => {
    const el = scope.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || fired.current) return
        fired.current = true
        io.disconnect()
        setTimeout(run, 900)
      },
      { threshold: 0.5 }
    )
    io.observe(el)
    return () => io.disconnect()
    // run is stable enough for a one-shot observer
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const label = result.phase === "sending" ? sending : result.phase === "idle" ? send : resend

  return (
    <figure ref={scope} data-ui className={cn("overflow-hidden rounded-xl bg-surface font-mono text-[0.8125rem]", className)}>
      {/* Request line */}
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <p className="min-w-0 truncate">
          <span className="font-semibold">{method}</span> <span className="text-muted-foreground">{url}</span>
        </p>
        <button
          type="button"
          onClick={run}
          disabled={result.phase === "sending"}
          className="press inline-flex h-9 shrink-0 items-center rounded-md bg-foreground px-3.5 font-sans text-small font-medium text-background disabled:opacity-70"
        >
          {label}
          {result.phase === "sending" && <span aria-hidden>…</span>}
        </button>
      </div>

      {/* The path: one row per layer, a packet travelling the rail. */}
      <div data-rail className="relative px-4 py-2">
        <span aria-hidden className="absolute top-6 bottom-6 left-[1.4375rem] w-px bg-foreground/15" />
        <span
          aria-hidden
          data-packet
          className="invisible absolute top-0 left-[1.1875rem] z-10 -mt-[5px] size-2.5 rounded-full bg-primary"
        />
        <ol>
          {path.map((group) => {
            const isOpen = open === group.layer
            const panel = `trace-${group.layer}`

            return (
              <li key={group.layer}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panel}
                  onClick={() => setOpen(isOpen ? null : (group.layer ?? null))}
                  className="group grid w-full grid-cols-[1rem_6.5rem_minmax(0,1fr)_auto] items-center gap-3 rounded-md py-2.5 text-left hover:bg-background/60"
                >
                  <span
                    aria-hidden
                    data-dot
                    className="relative z-0 ml-[0.1875rem] size-2.5 rounded-full border border-foreground/40 bg-surface"
                  />
                  <span className="font-semibold">{group.group}</span>
                  <span className="truncate text-muted-foreground">{group.items.join(", ")}</span>
                  <IconChevronDown
                    aria-hidden
                    stroke={1.75}
                    className={cn("size-4 text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")}
                  />
                </button>
                <div
                  id={panel}
                  role="region"
                  aria-label={group.group}
                  className={cn(
                    "grid transition-[grid-template-rows] duration-300 ease-glide motion-reduce:transition-none",
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  )}
                >
                  <div className="overflow-hidden" inert={!isOpen}>
                    <p className="pb-3 pl-7 font-sans text-small text-foreground">{group.note}</p>
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      </div>

      {/* Response */}
      <div className="border-t px-4 py-3" aria-live="polite">
        {result.phase === "done" ? (
          <>
            <p>
              <span className="font-semibold text-accent-ink">{result.status} OK</span>{" "}
              <span className="text-muted-foreground">
                · {result.ms} ms {measured}
              </span>
            </p>
            <pre className="mt-2 max-h-40 overflow-auto text-[0.75rem] leading-relaxed text-muted-foreground">
              <code>{result.body}</code>
            </pre>
          </>
        ) : result.phase === "error" ? (
          <p className="text-destructive">{result.message}</p>
        ) : (
          <p className="text-muted-foreground">{result.phase === "sending" ? `${sending}…` : "No response yet."}</p>
        )}
      </div>
    </figure>
  )
}
