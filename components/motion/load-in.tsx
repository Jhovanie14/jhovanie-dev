"use client"

import { useRef } from "react"

import { duration, ease, fullMotion, gsap, stagger, useGSAP } from "@/lib/motion"

/**
 * The first screen's load sequence: every [data-load] inside arrives in
 * document order, rising 12px, settled by about 1.2s. They are pre-hidden by
 * CSS only under html.js + no-preference (globals.css), so the first frame
 * never flashes and nothing hides without JavaScript.
 */
export function LoadIn({
  children,
  className,
  delay = 0.35,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const scope = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(fullMotion, () => {
        gsap.fromTo(
          "[data-load]",
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: duration.move, ease: ease.out, stagger: stagger.item, delay }
        )
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
