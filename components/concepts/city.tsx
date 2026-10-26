"use client"

import { useRef, useState } from "react"

import { site } from "@/content/site"
import { toolMentions } from "@/lib/concepts"
import { gsap, motionOK, useGSAP } from "@/lib/gsap-concepts"

/*
 * Concept: Night city. The stack as a skyline: one tower per tool, its height
 * from how often the tool appears in the work. Scrolling runs the hour from
 * blue hour to night (flat sky colours, no gradient); windows light as it gets
 * dark. "Ship it" sends a deploy train across the bridge. The tower you pick
 * turns dawn silver. Black towers, amber windows, one silver facade.
 */

const C = { blue: "#2440A8", night: "#0A0F24", tower: "#05070F", window: "#FFB347", river: "#0E1630", text: "#EEF1F8", soft: "#AFB8D0", silver: "#C9D3E6" }
const W = 1200
const GROUND = 430
const H = 600

function hash(s: string) {
  let h = 2166136261
  for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  return (h >>> 0) / 4294967296
}

let cursor = 24
const towers = toolMentions().map((t) => {
  const w = 56 + Math.round(hash(t.name) * 34)
  const x = cursor
  cursor += w + 8 + Math.round(hash(t.name + "gap") * 14)
  const h = 90 + t.where.length * 62
  const windows: { x: number; y: number; on: number }[] = []
  for (let wy = GROUND - h + 14; wy < GROUND - 14; wy += 18) {
    for (let wx = x + 8; wx < x + w - 10; wx += 13) windows.push({ x: wx, y: wy, on: hash(t.name + wx + wy) })
  }
  return { ...t, x, w, h, windows }
})
const scaleX = W / cursor

const captions = [
  { time: "18:40", text: site.bio.short },
  { time: "21:15", text: `${site.services.length} things you can hire me for: ${site.services.map((s) => s.title.toLowerCase()).join(", ")}.` },
  { time: "23:50", text: `${site.availability.label}. The lights stay on.` },
]

export function City() {
  const scope = useRef<HTMLDivElement>(null)
  const [pick, setPick] = useState<string | null>(null)
  const [trains, setTrains] = useState(0)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(motionOK, () => {
        gsap.from("[data-tower]", { scaleY: 0, transformOrigin: "50% 100%", duration: 1, ease: "expo.out", stagger: 0.05, delay: 0.2 })

        // The hour: pinned while the sky steps through blue hour into night.
        const tl = gsap.timeline({
          scrollTrigger: { trigger: "[data-stage]", start: "top top", end: "+=180%", scrub: true, pin: true },
        })
        tl.to("[data-sky]", { backgroundColor: C.night, ease: "none", duration: 1 }, 0)
          .to("[data-window]", { opacity: 1, ease: "none", stagger: { each: 0.002, from: "random" }, duration: 0.2 }, 0.1)
          .fromTo("[data-cap='0']", { opacity: 1 }, { opacity: 0, duration: 0.15 }, 0.3)
          .fromTo("[data-cap='1']", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.15 }, 0.35)
          .to("[data-cap='1']", { opacity: 0, duration: 0.15 }, 0.65)
          .fromTo("[data-cap='2']", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.15 }, 0.7)
      })
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set("[data-sky]", { backgroundColor: C.night })
        gsap.set("[data-window]", { opacity: 1 })
      })
      return () => mm.revert()
    },
    { scope }
  )

  // Ship it: a deploy train crosses the bridge.
  function ship() {
    setTrains((n) => n + 1)
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    gsap.fromTo("[data-train]", { x: -260 }, { x: W + 40, duration: reduce ? 0 : 3.2, ease: "power1.inOut" })
  }

  const picked = towers.find((t) => t.name === pick)

  return (
    <div ref={scope} className="pt-11 font-[family-name:var(--font-bsd)] selection:bg-[#FFB347] selection:text-black" style={{ color: C.text, background: C.night }}>
      <section data-stage data-sky aria-labelledby="ct-title" className="relative h-[calc(100svh-2.75rem)] overflow-hidden" style={{ background: C.blue }}>
        <div className="relative z-10 mx-auto max-w-[90rem] px-5 pt-8 sm:px-10">
          <h1 id="ct-title" className="font-[family-name:var(--font-bsd)] text-[clamp(3rem,8vw,7.5rem)] leading-[0.85] font-extrabold uppercase">
            {site.name}
          </h1>
          <p className="mt-3 text-[clamp(1.125rem,1.6vw,1.5rem)] font-medium">{site.role}. The taller the tower, the more of my work it carries.</p>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <a
              href={site.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center px-6 text-[1.125rem] font-semibold uppercase transition-transform duration-150 active:scale-[0.97]"
              style={{ background: C.window, color: C.tower }}
            >
              {site.cta.book}
            </a>
            <button
              type="button"
              onClick={ship}
              className="h-12 border-2 px-5 text-[1.125rem] font-semibold uppercase transition-colors duration-150 hover:bg-[#EEF1F81A]"
              style={{ borderColor: C.text }}
            >
              Ship it
            </button>
            <span aria-live="polite" className="text-[1rem]" style={{ color: C.soft }}>
              {trains > 0 && `${trains} ${trains === 1 ? "deploy" : "deploys"} crossed the river`}
            </span>
          </div>
          <div className="relative mt-6 h-16 max-w-[44ch] text-[clamp(1.0625rem,1.4vw,1.25rem)]">
            {captions.map((c, i) => (
              <p key={c.time} data-cap={i} className="absolute inset-0" style={{ opacity: i === 0 ? 1 : 0 }}>
                <span className="font-semibold tabular-nums" style={{ color: C.window }}>
                  {c.time}
                </span>{" "}
                {c.text}
              </p>
            ))}
          </div>
        </div>

        {/* The skyline, its river and the bridge. */}
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" className="absolute inset-x-0 bottom-0 h-[62%] w-full" role="group" aria-label="Skyline of the stack">
          <g transform={`scale(${scaleX} 1)`}>
            {towers.map((t) => {
              const on = pick === t.name
              return (
                <g
                  key={t.name}
                  role="button"
                  tabIndex={0}
                  aria-label={`${t.name}: appears ${t.where.length} times`}
                  aria-pressed={on}
                  onClick={() => setPick(on ? null : t.name)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      setPick(on ? null : t.name)
                    }
                  }}
                  className="cursor-pointer outline-none"
                >
                  <g data-tower>
                    <rect x={t.x} y={GROUND - t.h} width={t.w} height={t.h} fill={on ? C.silver : C.tower} />
                    {t.windows.map((w, i) => (
                      <rect key={i} data-window x={w.x} y={w.y} width={6} height={8} fill={C.window} opacity={w.on > 0.55 ? 0 : 0.15} />
                    ))}
                  </g>
                  {/* Reflection in the river: the same tower, flipped and dim. */}
                  <rect x={t.x} y={GROUND + 18} width={t.w} height={t.h * 0.5} fill={on ? C.silver : C.tower} opacity={0.35} />
                </g>
              )
            })}
          </g>
          <rect x={0} y={GROUND + 4} width={W} height={H} fill={C.river} opacity={0.75} />
          {/* The bridge and the train that crosses it on every deploy. */}
          <rect x={0} y={GROUND} width={W} height={8} fill={C.tower} />
          <g data-train transform="translate(-260 0)">
            {[0, 1, 2, 3].map((i) => (
              <g key={i}>
                <rect x={i * 62} y={GROUND - 16} width={56} height={16} fill={C.text} />
                {[8, 20, 32, 44].map((wx) => (
                  <rect key={wx} x={i * 62 + wx} y={GROUND - 12} width={6} height={5} fill={C.window} />
                ))}
              </g>
            ))}
          </g>
        </svg>

        {/* The tower you picked. */}
        <div aria-live="polite" className="absolute right-5 bottom-5 z-10 max-w-xs text-right sm:right-10">
          {picked ? (
            <>
              <p className="font-[family-name:var(--font-bsd)] text-[2rem] leading-none font-extrabold uppercase" style={{ color: C.silver }}>
                {picked.name}
              </p>
              <p className="mt-1 text-[1rem]">{picked.where.join(" · ")}</p>
            </>
          ) : (
            <p className="text-[1rem]" style={{ color: C.soft }}>
              Tap a tower. Scroll to run the night.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
