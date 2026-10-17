import { site, type Project } from "@/content/site"

const LINE_COUNT = 4

/** CSS colour for a line token (1-based, cycles through the four lines). */
export function lineColor(n: number) {
  return `var(--line-${((n - 1) % LINE_COUNT) + 1})`
}

function projectIndex(project: Project) {
  return site.projects.findIndex((p) => p.slug === project.slug)
}

/** Station code, e.g. "JF-03". Stable: derived from the order in site.projects. */
export function projectCode(project: Project) {
  return `JF-${String(projectIndex(project) + 1).padStart(2, "0")}`
}

/** Each project rides its own line colour. */
export function projectLine(project: Project) {
  return lineColor(projectIndex(project) + 1)
}

/** Featured projects; falls back to the first projects if none are flagged. */
export function featuredProjects(max: number) {
  const featured = site.projects.filter((p) => p.featured)
  return (featured.length > 0 ? featured : site.projects).slice(0, max)
}

/**
 * Bento rhythm for project grids: wide, half, half, wide, …
 * A half card left alone on the last row goes wide instead of leaving a hole.
 */
export function isWideCard(index: number, total: number) {
  return index % 3 === 0 || (index === total - 1 && index % 3 === 1)
}
