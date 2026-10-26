"use client"

import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { SplitText } from "gsap/SplitText"
import { useGSAP } from "@gsap/react"

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP)

/**
 * Motion tokens. See DESIGN.md §5. Mirrors the CSS custom properties in
 * globals.css so GSAP and CSS transitions move on the same curves.
 */
export const ease = {
  /** Entrances and moving hovers under 600ms. */
  out: "quint.out",
  /** Reveals of 800ms and longer: line rises, picture openings. */
  expo: "expo.out",
  /** Wipes and things that travel while visible. */
  inOut: "quart.inOut",
  /** Slow scale and drift on pictures. */
  soft: "cubic.out",
} as const

export const duration = {
  ui: 0.24,
  move: 0.45,
  reveal: 0.8,
  open: 1.2,
} as const

export const stagger = {
  char: 0.03,
  line: 0.09,
  item: 0.07,
} as const

/** Reveals fire once, when the element's top is 88% down the viewport. */
export const revealStart = "top 88%"

export const reducedMotion = "(prefers-reduced-motion: reduce)"
export const fullMotion = "(prefers-reduced-motion: no-preference)"

export { gsap, ScrollTrigger, useGSAP }
