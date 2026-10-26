import { site } from "@/content/site"

/** Featured projects; falls back to the first projects if none are flagged. */
export function featuredProjects(max: number) {
  const featured = site.projects.filter((p) => p.featured)
  return (featured.length > 0 ? featured : site.projects).slice(0, max)
}
