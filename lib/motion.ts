import type { Transition } from "motion/react"

// Motion tokens. See DESIGN.md §5.
export const spring = {
  // Nav marker glide: damped and physical, never snapped.
  marker: { type: "spring", stiffness: 380, damping: 34, mass: 0.8 },
} satisfies Record<string, Transition>
