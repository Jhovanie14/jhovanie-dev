"use client"

import AnimatedContent from "@/components/react-bits/animated-content"
import { duration, ease, stagger } from "@/lib/motion"

/**
 * A section's parts arriving in reading order: each direct child rises
 * 24px with opacity, staggered, once, as the block's top reaches 88% of
 * the viewport (React Bits AnimatedContent on the house tokens).
 * Reduced motion and no-JS show everything at rest.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  each = stagger.item,
  distance = 24,
  onMount = false,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
  /** Seconds between children; 0 moves the block as one. */
  each?: number
  distance?: number
  /** Above the fold: play on load instead of waiting for scroll. */
  onMount?: boolean
}) {
  return (
    <AnimatedContent
      className={className}
      distance={distance}
      duration={duration.reveal}
      ease={ease.expo}
      stagger={each}
      threshold={0.12}
      delay={delay}
      trigger={onMount ? "mount" : "scroll"}
    >
      {children}
    </AnimatedContent>
  )
}
