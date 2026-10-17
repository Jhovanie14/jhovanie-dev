import { site } from "@/content/site"

/** Index of the nav station a path belongs to (/projects/foo → Projects), or -1. */
export function stationIndex(pathname: string) {
  return site.nav.findIndex(({ href }) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`)
  )
}

/**
 * View transition type for a navigation: lower in the nav list = further down
 * the line = "nav-forward"; higher = "nav-back". See DESIGN.md §5.
 */
export function navTransition(from: string, to: string): string[] {
  const current = stationIndex(from)
  const target = stationIndex(to)
  if (target === -1) return []
  if (current === -1 || target > current) return ["nav-forward"]
  if (target < current) return ["nav-back"]
  // Same station: going deeper (/projects → /projects/foo) is forward.
  return to.length > from.length ? ["nav-forward"] : to.length < from.length ? ["nav-back"] : []
}
