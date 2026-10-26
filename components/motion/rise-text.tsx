"use client"

import SplitText from "@/components/react-bits/split-text"
import { duration, ease, stagger } from "@/lib/motion"

/**
 * A heading set like type: it rises out of its own line mask (React Bits
 * SplitText on the house tokens). Lines for headings and statements;
 * characters only for a heading of one to three words (DESIGN.md §5).
 */
export function RiseText({
  text,
  as = "h2",
  id,
  className,
  by = "lines",
  onLoad = false,
  delay = 0,
}: {
  text: string
  as?: "h1" | "h2" | "h3" | "p"
  id?: string
  className?: string
  by?: "lines" | "chars"
  /** Above the fold: play on load instead of waiting for scroll. */
  onLoad?: boolean
  /** Seconds before the first piece moves. */
  delay?: number
}) {
  const chars = by === "chars"

  return (
    <SplitText
      text={text}
      tag={as}
      id={id}
      className={className}
      splitType={by}
      mask
      textAlign="left"
      trigger={onLoad ? "load" : "view"}
      threshold={0.12}
      rootMargin="0px"
      duration={duration.reveal + 0.1}
      delay={(chars ? stagger.char : stagger.line) * 1000}
      ease={ease.expo}
      from={{ yPercent: 110 }}
      to={{ yPercent: 0, delay }}
    />
  )
}
