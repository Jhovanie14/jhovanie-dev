"use client"

import { useRef } from "react"

import { ease, fullMotion, gsap, useGSAP } from "@/lib/motion"

/**
 * The hero's load sequence, settled by 1.2s (DESIGN.md §5): the name rises
 * (RiseText, on its own), the illustration opens from the bottom and settles,
 * then the sentence and the actions arrive. As the hero leaves, the picture
 * drifts a few percent, locked to the scrollbar.
 * Targets: [data-load-open] (the plate), [data-load-picture], [data-load].
 */
export function HeroMotion({ children, className }: { children: React.ReactNode; className?: string }) {
  const scope = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(fullMotion, () => {
        const tl = gsap.timeline({ defaults: { ease: ease.out } })
        tl.fromTo(
          "[data-load-open]",
          { clipPath: "inset(100% 0% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: ease.inOut },
          0.15
        )
          .fromTo("[data-load-picture]", { scale: 1.08 }, { scale: 1, duration: 1.1, ease: ease.expo }, 0.1)
          .fromTo(
            "[data-load]",
            { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.06 },
            0.42
          )

        gsap.to("[data-drift]", {
          yPercent: 6,
          ease: "none",
          scrollTrigger: { trigger: scope.current, start: "top top", end: "bottom top", scrub: true },
        })
      })
      return () => mm.revert()
    },
    { scope }
  )

  return (
    <div ref={scope} className={className}>
      {children}
    </div>
  )
}
