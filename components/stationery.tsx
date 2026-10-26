import { useId } from "react"

import { cn } from "@/lib/utils"

/*
 * The printed pieces of the line (DESIGN.md §2): edges cut into scallops or a
 * zigzag, perforations of round dots, notches. All are filled shapes drawn
 * as SVG patterns, so the circles stay round at any width. Never outlines.
 */

const R = 12 // scallop radius / zigzag height, px

/**
 * A cut edge for a panel. Its colour is `currentColor`, so give it the
 * panel's fill as a text colour (e.g. `text-card`) and butt it to the panel.
 */
export function CutEdge({
  kind,
  side,
  className,
}: {
  kind: "scallop" | "zigzag"
  side: "top" | "bottom"
  className?: string
}) {
  const id = useId()
  const w = R * 2

  return (
    <svg
      aria-hidden
      width="100%"
      height={R}
      className={cn("block", side === "bottom" && "-scale-y-100", className)}
    >
      <defs>
        <pattern id={id} width={w} height={R} patternUnits="userSpaceOnUse">
          {kind === "scallop" ? (
            <circle cx={R} cy={R} r={R} fill="currentColor" />
          ) : (
            <path d={`M0 ${R} L${R} 0 L${w} ${R} Z`} fill="currentColor" />
          )}
        </pattern>
      </defs>
      <rect width="100%" height={R} fill={`url(#${id})`} />
    </svg>
  )
}

/** A row of round holes, like a ticket's tear line. Holes take the page ground. */
export function Perforation({
  orientation,
  className,
}: {
  orientation: "horizontal" | "vertical"
  className?: string
}) {
  const id = useId()
  const vertical = orientation === "vertical"

  return (
    <svg
      aria-hidden
      width={vertical ? 6 : "100%"}
      height={vertical ? "100%" : 6}
      className={cn("block shrink-0", className)}
    >
      <defs>
        <pattern
          id={id}
          width={vertical ? 6 : 13}
          height={vertical ? 13 : 6}
          patternUnits="userSpaceOnUse"
        >
          <circle cx="3" cy="3" r="3" fill="var(--background)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}

/**
 * Two half-circle notches cut where a perforation meets the panel's edges.
 * Place inside a `relative overflow-hidden` panel; `at` is the perforation's
 * offset along the panel (a CSS length).
 */
export function Notches({ orientation, at }: { orientation: "horizontal" | "vertical"; at: string }) {
  const notch = "absolute size-7 rounded-full bg-background"

  return orientation === "vertical" ? (
    <>
      <span aria-hidden className={cn(notch, "-top-3.5 -translate-x-1/2")} style={{ left: at }} />
      <span aria-hidden className={cn(notch, "-bottom-3.5 -translate-x-1/2")} style={{ left: at }} />
    </>
  ) : (
    <>
      <span aria-hidden className={cn(notch, "-left-3.5 -translate-y-1/2")} style={{ top: at }} />
      <span aria-hidden className={cn(notch, "-right-3.5 -translate-y-1/2")} style={{ top: at }} />
    </>
  )
}
