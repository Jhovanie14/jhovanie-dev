"use client"

import { useEffect, useRef, useState } from "react"

import { site } from "@/content/site"
import { toolMentions } from "@/lib/concepts"
import { gsap, motionOK } from "@/lib/gsap-concepts"

/*
 * Concept: Toolbox. Every tool is a tag with weight. They drop into the box,
 * stack on each other, and can be thrown; a tag clicked without throwing
 * says where it is used. A small hand-rolled physics step (gravity, walls,
 * tag-to-tag collision) keeps it light. Teal box, paper tags, one yellow.
 */

const C = { ground: "#0F3D3E", paper: "#F5F1E8", ink: "#10201F", yellow: "#FFD447", soft: "#A9C4C1" }
const tools = toolMentions()

type Body = { x: number; y: number; vx: number; vy: number; w: number; h: number }

export function Toolbox() {
  const box = useRef<HTMLDivElement>(null)
  const [pick, setPick] = useState<string | null>(null)
  const bodies = useRef<Body[]>([])
  const shake = useRef(false)

  useEffect(() => {
    const root = box.current!
    const tags = [...root.querySelectorAll<HTMLElement>("[data-tag]")]
    // Reduced motion: no physics; CSS lays the tags out in rows instead.
    if (!window.matchMedia(motionOK).matches) return
    const W = () => root.clientWidth
    const H = () => root.clientHeight
    bodies.current = tags.map((el, i) => ({
      x: 40 + ((i * 97) % Math.max(1, W() - 200)),
      y: -120 - i * 70,
      vx: (Math.random() - 0.5) * 4,
      vy: 0,
      w: el.offsetWidth,
      h: el.offsetHeight,
    }))

    let held: number | null = null
    let last = { x: 0, y: 0, t: 0 }
    let moved = false

    const step = () => {
      const b = bodies.current
      if (shake.current) {
        b.forEach((o) => {
          o.vx += (Math.random() - 0.5) * 30
          o.vy -= 14 + Math.random() * 10
        })
        shake.current = false
      }
      for (let i = 0; i < b.length; i++) {
        const o = b[i]
        if (i === held) continue
        o.vy += 0.6
        o.vx *= 0.995
        o.x += o.vx
        o.y += o.vy
        if (o.y + o.h > H()) {
          o.y = H() - o.h
          o.vy *= -0.35
          o.vx *= 0.85
        }
        if (o.x < 0) {
          o.x = 0
          o.vx *= -0.5
        }
        if (o.x + o.w > W()) {
          o.x = W() - o.w
          o.vx *= -0.5
        }
      }
      // Tag against tag: push apart along the shallower overlap.
      for (let i = 0; i < b.length; i++) {
        for (let j = i + 1; j < b.length; j++) {
          const p = b[i], q = b[j]
          const ox = Math.min(p.x + p.w, q.x + q.w) - Math.max(p.x, q.x)
          const oy = Math.min(p.y + p.h, q.y + q.h) - Math.max(p.y, q.y)
          if (ox <= 0 || oy <= 0) continue
          if (oy < ox) {
            const dir = p.y < q.y ? -1 : 1
            if (i !== held) p.y += (dir * oy) / 2
            if (j !== held) q.y -= (dir * oy) / 2
            const v = (p.vy + q.vy) / 2
            p.vy = v * 0.6
            q.vy = v * 0.6
          } else {
            const dir = p.x < q.x ? -1 : 1
            if (i !== held) p.x += (dir * ox) / 2
            if (j !== held) q.x -= (dir * ox) / 2
            const v = (p.vx + q.vx) / 2
            p.vx = v
            q.vx = v
          }
        }
      }
      tags.forEach((el, i) => {
        const o = b[i]
        el.style.transform = `translate(${o.x}px, ${o.y}px) rotate(${Math.max(-12, Math.min(12, o.vx * 1.5))}deg)`
      })
    }

    const down = (e: PointerEvent) => {
      const i = tags.indexOf((e.target as HTMLElement).closest("[data-tag]") as HTMLElement)
      if (i < 0) return
      held = i
      moved = false
      last = { x: e.clientX, y: e.clientY, t: performance.now() }
      tags[i].setPointerCapture(e.pointerId)
    }
    const move = (e: PointerEvent) => {
      if (held === null) return
      const o = bodies.current[held]
      const dt = Math.max(1, performance.now() - last.t)
      const dx = e.clientX - last.x
      const dy = e.clientY - last.y
      if (Math.abs(dx) + Math.abs(dy) > 3) moved = true
      o.x += dx
      o.y += dy
      o.vx = (dx / dt) * 16
      o.vy = (dy / dt) * 16
      last = { x: e.clientX, y: e.clientY, t: performance.now() }
    }
    const up = () => {
      if (held !== null && !moved) {
        const name = tools[held].name
        setPick((p) => (p === name ? null : name))
      }
      held = null
    }
    root.addEventListener("pointerdown", down)
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", up)
    gsap.ticker.add(step)
    return () => {
      gsap.ticker.remove(step)
      root.removeEventListener("pointerdown", down)
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", up)
    }
  }, [])

  const picked = tools.find((t) => t.name === pick)

  return (
    <div className="min-h-svh pt-11 font-[family-name:var(--font-rubik)] selection:bg-[#FFD447] selection:text-black" style={{ background: C.ground, color: C.paper }}>
      <div className="mx-auto grid max-w-[96rem] gap-8 px-5 pt-8 pb-12 sm:px-10 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
        <div className="lg:pt-6">
          <h1 className="text-[clamp(2.75rem,5.5vw,5rem)] leading-[0.92] font-bold tracking-[-0.03em]">{site.name}</h1>
          <p className="mt-4 max-w-[34ch] text-[clamp(1.0625rem,1.4vw,1.25rem)]">
            {site.role}. This is my toolbox. Throw things around; click a tag to see where I use it.
          </p>
          <div aria-live="polite" className="mt-8 min-h-28">
            {picked ? (
              <>
                <p className="text-[1.75rem] font-bold" style={{ color: C.yellow }}>
                  {picked.name}
                </p>
                <p className="mt-1 text-[16px]">
                  {picked.group} · used in {picked.where.length} places
                </p>
                <p className="mt-1 text-[16px]" style={{ color: C.soft }}>
                  {picked.where.join(" · ")}
                </p>
              </>
            ) : (
              <p className="text-[16px]" style={{ color: C.soft }}>
                Nothing picked yet.
              </p>
            )}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <a
              href={site.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center rounded-full px-6 font-semibold transition-transform duration-150 active:scale-[0.97]"
              style={{ background: C.yellow, color: C.ink }}
            >
              {site.cta.book}
            </a>
            <button
              type="button"
              onClick={() => (shake.current = true)}
              className="h-12 rounded-full border-2 px-5 font-semibold transition-colors duration-150 hover:bg-[#F5F1E81A] motion-reduce:hidden"
              style={{ borderColor: C.paper }}
            >
              Shake the box
            </button>
          </div>
        </div>

        {/* The box. */}
        <div
          ref={box}
          role="group"
          aria-label="Toolbox"
          className="relative h-[min(70svh,40rem)] touch-none overflow-hidden rounded-2xl motion-reduce:flex motion-reduce:flex-wrap motion-reduce:content-start motion-reduce:gap-3 motion-reduce:p-4"
          style={{ background: "#0B3132" }}
        >
          {tools.map((t) => (
            <button
              key={t.name}
              type="button"
              data-tag
              aria-pressed={pick === t.name}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  setPick(pick === t.name ? null : t.name)
                }
              }}
              onClick={() => {
                // With physics running, pointer up decides; without it, a click picks.
                if (!window.matchMedia(motionOK).matches) setPick(pick === t.name ? null : t.name)
              }}
              className="cursor-grab rounded-full px-[1.1em] py-[0.55em] font-semibold whitespace-nowrap select-none active:cursor-grabbing motion-safe:absolute motion-safe:top-0 motion-safe:left-0 motion-safe:[transform:translate(-999px,-999px)]"
              style={{
                background: pick === t.name ? C.yellow : C.paper,
                color: C.ink,
                fontSize: `${0.95 + t.where.length * 0.14}rem`,
              }}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
