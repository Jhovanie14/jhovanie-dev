"use client"

import { useEffect, useRef, useState } from "react"

import { site } from "@/content/site"
import { gsap, motionOK } from "@/lib/gsap-concepts"
import { cn } from "@/lib/utils"

/*
 * Concept: Cracktro. A demoscene title screen. One bitmap face on an emissive
 * black void; three fields of grey stars drift at layered speeds; the intro
 * rides a sine scroller. Nothing is boxed or ruled. One amber caret.
 */

const C = { void: "#050505", ivory: "#EDE7D9", dust: ["#2E2E2E", "#5E5E5E", "#A7A7A7"], amber: "#FFB000" }

const MESSAGE = [
  `HELLO VISITOR`,
  `${site.name} PRESENTS: ${site.role}`,
  site.bio.short,
  `STACK: ${site.skills.flatMap((g) => g.items).join(" + ")}`,
  site.availability.label,
  `PRESS 3 TO BOOK A CALL`,
  `GREETINGS TO EVERY TEAM THAT SHIPS ON A FRIDAY`,
]
  .join("   ***   ")
  .toUpperCase()

const menu = [
  { key: "1", label: "Work" },
  { key: "2", label: "Stack" },
  { key: "3", label: "Hire" },
] as const

export function Cracktro() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState<(typeof menu)[number]["key"]>("1")
  const speed = useRef(2.2)
  const paused = useRef(false)

  // Three star fields at three speeds, drawn on one canvas.
  useEffect(() => {
    const el = canvas.current!
    const ctx = el.getContext("2d")!
    const motion = window.matchMedia(motionOK).matches
    let stars: { x: number; y: number; layer: number }[] = []
    const resize = () => {
      el.width = el.clientWidth * devicePixelRatio
      el.height = el.clientHeight * devicePixelRatio
      stars = Array.from({ length: 260 }, (_, i) => ({ x: Math.random() * el.width, y: Math.random() * el.height, layer: i % 3 }))
    }
    resize()
    window.addEventListener("resize", resize)
    const draw = () => {
      ctx.fillStyle = C.void
      ctx.fillRect(0, 0, el.width, el.height)
      for (const s of stars) {
        if (motion && !paused.current) {
          s.x -= (s.layer + 1) * 0.45 * devicePixelRatio * (speed.current / 2.2)
          if (s.x < 0) s.x += el.width
        }
        ctx.fillStyle = C.dust[s.layer]
        const size = (s.layer + 1) * devicePixelRatio
        ctx.fillRect(Math.round(s.x), Math.round(s.y), size, size)
      }
    }
    draw()
    if (!motion) return () => window.removeEventListener("resize", resize)
    gsap.ticker.add(draw)
    return () => {
      gsap.ticker.remove(draw)
      window.removeEventListener("resize", resize)
    }
  }, [])

  // The sine scroller: every letter rides the wave as the line slides left.
  useEffect(() => {
    const root = scroller.current!
    const chars = [...root.querySelectorAll<HTMLElement>("[data-ch]")]
    const motion = window.matchMedia(motionOK).matches
    let offset = -root.clientWidth
    let t = 0
    const step = () => {
      if (!paused.current) {
        offset += speed.current
        t += 0.05
      }
      const width = chars.length * 26
      if (offset > width) offset = -root.clientWidth
      for (let i = 0; i < chars.length; i++) {
        const x = i * 26 - offset
        if (x < -40 || x > root.clientWidth + 40) {
          chars[i].style.visibility = "hidden"
          continue
        }
        chars[i].style.visibility = "visible"
        chars[i].style.transform = `translate(${x}px, ${Math.sin(x * 0.012 + t) * 34}px)`
      }
    }
    if (!motion) {
      // Still: the message laid out flat, as much as fits.
      chars.forEach((ch, i) => {
        const x = i * 26
        ch.style.visibility = x < root.clientWidth - 26 ? "visible" : "hidden"
        ch.style.transform = `translate(${x}px, 0)`
      })
      return
    }
    gsap.ticker.add(step)
    return () => gsap.ticker.remove(step)
  }, [])

  // Keys, as on every intro: 1-3 menu, arrows speed, space pause.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "1" || e.key === "2" || e.key === "3") setOpen(e.key)
      if (e.key === "3") window.open(site.bookingUrl, "_blank", "noopener")
      if (e.key === "ArrowRight") speed.current = Math.min(8, speed.current + 0.8)
      if (e.key === "ArrowLeft") speed.current = Math.max(0.4, speed.current - 0.8)
      if (e.key === " " && e.target === document.body) {
        e.preventDefault()
        paused.current = !paused.current
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <div className="relative min-h-svh overflow-hidden pt-11 font-[family-name:var(--font-silkscreen)] selection:bg-[#FFB000] selection:text-black" style={{ background: C.void, color: C.ivory }}>
      <canvas ref={canvas} aria-hidden className="absolute inset-0 size-full" />

      <div className="relative mx-auto flex min-h-[calc(100svh-2.75rem)] max-w-[90rem] flex-col px-5 pt-[10svh] pb-10 sm:px-10">
        <h1 className="text-[clamp(2.5rem,8.5vw,8rem)] leading-[0.95] uppercase">
          {site.name}
          <span aria-hidden className="ml-2 inline-block h-[0.8em] w-[0.45em] animate-pulse align-baseline motion-reduce:animate-none" style={{ background: C.amber }} />
        </h1>
        <p className="mt-4 max-w-[46ch] text-[clamp(1rem,1.5vw,1.25rem)] leading-relaxed uppercase" style={{ color: C.dust[2] }}>
          {site.role} · {site.availability.label}
        </p>

        {/* The menu, keyboard first. */}
        <nav aria-label="Intro menu" className="mt-12 flex flex-wrap gap-x-10 gap-y-3 text-[clamp(1.125rem,2vw,1.5rem)] uppercase">
          {menu.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => {
                setOpen(m.key)
                if (m.key === "3") window.open(site.bookingUrl, "_blank", "noopener")
              }}
              aria-pressed={open === m.key}
              className={cn("transition-colors duration-150", open === m.key ? "text-[#FFB000]" : "hover:text-white")}
            >
              <span style={{ color: C.dust[1] }}>{m.key}</span> {m.label}
            </button>
          ))}
        </nav>

        <div aria-live="polite" className="mt-8 max-w-[60ch] text-[clamp(0.95rem,1.25vw,1.125rem)] leading-loose uppercase">
          {open === "1" && (
            <ul>
              {site.services.map((s) => (
                <li key={s.title}>
                  {s.title} <span style={{ color: C.dust[2] }}>· {s.stack.join(" ")}</span>
                </li>
              ))}
            </ul>
          )}
          {open === "2" && (
            <ul>
              {site.skills.map((g) => (
                <li key={g.group}>
                  {g.group} <span style={{ color: C.dust[2] }}>· {g.items.join(" ")}</span>
                </li>
              ))}
            </ul>
          )}
          {open === "3" && (
            <p>
              <a href={site.bookingUrl} target="_blank" rel="noopener noreferrer" className="underline decoration-[#FFB000] underline-offset-4" style={{ color: C.amber }}>
                Book a call
              </a>{" "}
              or write to <a href={`mailto:${site.email}`} className="underline underline-offset-4">{site.email}</a>
            </p>
          )}
        </div>

        {/* The sine scroller across the bottom of the screen. */}
        <div ref={scroller} aria-hidden className="relative mt-auto h-28 overflow-hidden text-[clamp(1.5rem,2.6vw,2.25rem)] uppercase">
          {[...MESSAGE].map((ch, i) => (
            <span key={i} data-ch className="absolute top-1/2 left-0 w-[26px] text-center" style={{ visibility: "hidden" }}>
              {ch}
            </span>
          ))}
        </div>
        <p className="sr-only">{MESSAGE}</p>
        <p className="mt-2 text-[13px] uppercase" style={{ color: C.dust[1] }}>
          Arrows: speed · Space: pause · 1 2 3: menu
        </p>
      </div>
    </div>
  )
}
