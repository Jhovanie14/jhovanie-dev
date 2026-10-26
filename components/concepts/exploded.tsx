"use client"

import { useRef, useState } from "react"

import { site } from "@/content/site"
import { gsap, motionOK, useGSAP } from "@/lib/gsap-concepts"
import { cn } from "@/lib/utils"

/*
 * Concept: Exploded. The stack as an engineering assembly drawn in CSS 3D:
 * one plate per layer, data at the base, edge on top. Scroll pulls the plates
 * apart along their axis; the assembly tilts toward the pointer; a picked
 * plate lifts clear. Concrete grey, four plate tones, one safety orange.
 */

const C = { ground: "#D9DCDF", ink: "#15181B", soft: "#4A5056", orange: "#FF5F1F" }

// Bottom to top, as the parts are stacked.
const order = ["data", "api", "interface", "edge"] as const
const tones = ["#2B2F33", "#9AA1A8", "#C3C8CD", "#F4F5F6"]
const inks = ["#F4F5F6", "#15181B", "#15181B", "#15181B"]
const plates = order.map((layer, i) => {
  const g = site.skills.find((s) => s.layer === layer)!
  return { layer, name: g.group, items: g.items, note: g.note ?? "", tone: tones[i], ink: inks[i] }
})

export function Exploded() {
  const scope = useRef<HTMLDivElement>(null)
  const [pick, setPick] = useState<string | null>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      // GSAP owns each plate's place on the axis; React never writes its transform.
      gsap.set("[data-plate]", { z: (i) => i * 18 })
      mm.add(motionOK, () => {
        gsap.from("[data-plate]", { opacity: 0, z: -200, duration: 0.9, ease: "expo.out", stagger: 0.1, delay: 0.2 })

        // Explode along the axis while the stage is held.
        gsap.to("[data-plate]", {
          z: (i) => i * 110,
          ease: "none",
          scrollTrigger: { trigger: "[data-ex-stage]", start: "top top", end: "+=140%", scrub: true, pin: true },
        })

        // Tilt toward the pointer, a few degrees, damped.
        const rx = gsap.quickTo("[data-assembly]", "rotationX", { duration: 0.8, ease: "power3.out" })
        const rz = gsap.quickTo("[data-assembly]", "rotationZ", { duration: 0.8, ease: "power3.out" })
        const onMove = (e: PointerEvent) => {
          rx(56 + (e.clientY / innerHeight - 0.5) * -10)
          rz(-36 + (e.clientX / innerWidth - 0.5) * 14)
        }
        window.addEventListener("pointermove", onMove)
        return () => window.removeEventListener("pointermove", onMove)
      })
      return () => mm.revert()
    },
    { scope }
  )

  const picked = plates.find((p) => p.layer === pick)

  return (
    <div ref={scope} className="pt-11 font-[family-name:var(--font-familjen)] selection:bg-[#FF5F1F] selection:text-white" style={{ background: C.ground, color: C.ink }}>
      <section data-ex-stage aria-labelledby="ex-title" className="relative grid h-[calc(100svh-2.75rem)] overflow-hidden lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        <div className="relative z-10 flex flex-col justify-center px-5 sm:px-10">
          <h1 id="ex-title" className="text-[clamp(2.75rem,5.5vw,5rem)] leading-[0.92] font-bold tracking-[-0.03em]">
            {site.name}
          </h1>
          <p className="mt-4 max-w-[34ch] text-[clamp(1.0625rem,1.4vw,1.25rem)]">
            {site.role}. An exploded view of what I ship: scroll to pull it apart, pick a part to read it.
          </p>

          <ul aria-label="Parts" className="mt-8 flex flex-col">
            {[...plates].reverse().map((p) => (
              <li key={p.layer}>
                <button
                  type="button"
                  aria-pressed={pick === p.layer}
                  onClick={() => setPick(pick === p.layer ? null : p.layer)}
                  className={cn("flex w-full items-baseline justify-between gap-4 py-2 text-left transition-colors duration-150", pick === p.layer ? "text-[#FF5F1F]" : "hover:text-black")}
                >
                  <span className="text-[1.25rem] font-semibold">{p.name}</span>
                  <span className="text-[15px]" style={{ color: pick === p.layer ? C.orange : C.soft }}>
                    {p.items.length} parts
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p aria-live="polite" className="mt-3 min-h-12 text-[16px]" style={{ color: C.soft }}>
            {picked ? `${picked.items.join(", ")}. ${picked.note}` : "Pick a part to read it."}
          </p>

          <a
            href={site.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex h-12 w-fit items-center px-6 font-semibold text-white transition-transform duration-150 active:scale-[0.97]"
            style={{ background: C.orange }}
          >
            {site.cta.book}
          </a>
        </div>

        {/* The assembly. */}
        <div className="relative grid place-items-center [perspective:1800px]">
          <div data-assembly className="relative h-[16rem] w-[22rem] [transform-style:preserve-3d] sm:h-[20rem] sm:w-[28rem]" style={{ transform: "rotateX(56deg) rotateZ(-36deg)" }}>
            {plates.map((p) => (
              <button
                key={p.layer}
                type="button"
                data-plate
                aria-label={`${p.name}: ${p.items.join(", ")}`}
                onClick={() => setPick(pick === p.layer ? null : p.layer)}
                className="absolute inset-0 text-left [transform-style:preserve-3d]"
              >
                {/* The face lifts clear when picked; the plate's own z stays with GSAP. */}
                <span
                  className="absolute inset-0 flex flex-col justify-between p-5 transition-[transform,outline-color] duration-300 ease-out"
                  style={{
                    background: p.tone,
                    color: p.ink,
                    transform: `translateZ(${pick === p.layer ? 60 : 0}px)`,
                    outline: `3px solid ${pick === p.layer ? C.orange : "transparent"}`,
                  }}
                >
                  <span className="text-[1.5rem] font-bold">{p.name}</span>
                  <span className="text-[15px] font-medium">{p.items.join(" · ")}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
