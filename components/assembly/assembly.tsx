"use client"

import { useRef, useState } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"

import { cn } from "@/lib/utils"

gsap.registerPlugin(ScrollTrigger, useGSAP)

/**
 * One part of an assembly: what the plate says, and the full text the legend
 * shows when it is picked.
 */
export type Part = { id: string; title: string; caption?: string; detail: string }

const tones = [
  { bg: "var(--plate-1)", ink: "var(--plate-1-ink)" },
  { bg: "var(--plate-2)", ink: "var(--plate-2-ink)" },
  { bg: "var(--plate-3)", ink: "var(--plate-3-ink)" },
  { bg: "var(--plate-4)", ink: "var(--plate-4-ink)" },
]

/**
 * The site's signature (DESIGN.md §5): parts stacked as flat CSS 3D plates,
 * base first. Scrolling pulls them apart along their axis (held in place when
 * `hold`), the assembly tilts toward the pointer, and a picked part lifts
 * clear with an orange edge. The legend is the accessible control; the plates
 * repeat it for the eye. Reduced motion shows the assembly at rest, exploded.
 */
export function Assembly({
  parts,
  label,
  hold = false,
  size = "lg",
  reverse = false,
  details = "on-pick",
  children,
  className,
}: {
  parts: Part[]
  /** Names the assembly for assistive tech, e.g. "The stack". */
  label: string
  /** Pin the section while it explodes (the hero). */
  hold?: boolean
  size?: "lg" | "md"
  /** Put the assembly on the left. */
  reverse?: boolean
  /** "always": every part's text is listed (case studies); "on-pick": shown for the picked part. */
  details?: "always" | "on-pick"
  /** Heading and copy above the legend. */
  children?: React.ReactNode
  className?: string
}) {
  const scope = useRef<HTMLElement>(null)
  const [pick, setPick] = useState<string | null>(null)
  // Plates rest already apart, so the first look reads as exploded; scroll opens them further.
  const gap = size === "lg" ? 104 : 84
  const rest = size === "lg" ? 34 : 28

  useGSAP(
    () => {
      const plates = gsap.utils.toArray<HTMLElement>("[data-plate]", scope.current)
      gsap.set(plates, { z: (i) => i * rest })

      const mm = gsap.matchMedia()
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Arrival: the parts come in collapsed and spread to rest.
        gsap.from(plates, {
          opacity: 0,
          z: 0,
          duration: 1.1,
          ease: "expo.out",
          stagger: 0.07,
          scrollTrigger: { trigger: scope.current, start: "top 80%", once: true },
        })

        // Explode along the axis, locked to the scrollbar.
        gsap.to(plates, {
          z: (i) => i * gap,
          ease: "none",
          scrollTrigger: hold
            ? { trigger: scope.current, start: "top top", end: "+=120%", scrub: true, pin: true }
            : { trigger: scope.current, start: "top 70%", end: "bottom 45%", scrub: true },
        })

        // Tilt toward the pointer, a few degrees, damped.
        const body = scope.current!.querySelector("[data-body]")
        const rx = gsap.quickTo(body, "rotationX", { duration: 0.8, ease: "power3.out" })
        const rz = gsap.quickTo(body, "rotationZ", { duration: 0.8, ease: "power3.out" })
        const onMove = (e: PointerEvent) => {
          rx(56 + (e.clientY / innerHeight - 0.5) * -10)
          rz(-36 + (e.clientX / innerWidth - 0.5) * 14)
        }
        window.addEventListener("pointermove", onMove)
        return () => window.removeEventListener("pointermove", onMove)
      })
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(plates, { z: (i) => i * gap * 0.6 })
      })
      return () => mm.revert()
    },
    { scope, dependencies: [hold, gap, rest] }
  )

  const picked = parts.find((p) => p.id === pick)
  const toggle = (id: string) => setPick((current) => (current === id ? null : id))

  return (
    <section
      ref={scope}
      aria-label={label}
      className={cn(
        "grid items-center gap-10 lg:gap-6",
        reverse ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]" : "lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]",
        hold && "min-h-[calc(100svh-4rem)]",
        className
      )}
    >
      <div className={cn("relative z-10", reverse && "lg:order-2")}>
        {children}

        <ul aria-label={`${label}: parts`} className="mt-8 flex flex-col">
          {[...parts].reverse().map((p) => (
            <li key={p.id}>
              <button
                type="button"
                aria-pressed={pick === p.id}
                onClick={() => toggle(p.id)}
                className={cn(
                  "flex w-full items-baseline justify-between gap-4 py-2 text-left transition-colors duration-150",
                  pick === p.id ? "text-accent-ink" : "hover:text-foreground"
                )}
              >
                <span className="text-lead font-semibold">{p.title}</span>
                {p.caption && <span className="min-w-0 text-right text-small text-muted-foreground">{p.caption}</span>}
              </button>
              {details === "always" && <p className="max-w-[56ch] pb-3 text-muted-foreground">{p.detail}</p>}
            </li>
          ))}
        </ul>
        {details === "on-pick" && (
          <p aria-live="polite" className="mt-3 min-h-14 max-w-[52ch] text-muted-foreground">
            {picked ? picked.detail : "Pick a part to read it."}
          </p>
        )}
      </div>

      {/* The assembly itself, for the eye; the legend above is the control. */}
      <div aria-hidden className="relative grid min-h-[26rem] place-items-center [perspective:1800px] sm:min-h-[34rem]">
        <div
          data-body
          className={cn(
            "relative [transform-style:preserve-3d]",
            size === "lg" ? "h-[13rem] w-[18rem] sm:h-[19rem] sm:w-[27rem] xl:h-[22rem] xl:w-[31rem]" : "h-[12rem] w-[16rem] sm:h-[16rem] sm:w-[22rem]"
          )}
          style={{ transform: "rotateX(56deg) rotateZ(-36deg)" }}
        >
          {parts.map((p, i) => {
            const tone = tones[i % tones.length]
            const on = pick === p.id
            return (
              <div key={p.id} data-plate className="absolute inset-0 [transform-style:preserve-3d]">
                <div
                  onClick={() => toggle(p.id)}
                  className="absolute inset-0 flex cursor-pointer flex-col justify-between p-4 transition-[transform,outline-color] duration-300 ease-out sm:p-5"
                  style={{
                    background: tone.bg,
                    color: tone.ink,
                    transform: `translateZ(${on ? 56 : 0}px)`,
                    outline: `3px solid ${on ? "var(--primary)" : "transparent"}`,
                  }}
                >
                  <span className="text-[1.25rem] leading-tight font-bold sm:text-[1.5rem]">{p.title}</span>
                  {p.caption && <span className="text-[14px] font-medium sm:text-[15px]">{p.caption}</span>}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
