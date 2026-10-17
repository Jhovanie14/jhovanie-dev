import Image from "next/image"

import type { Project } from "@/content/site"
import { hasPublicFile } from "@/lib/assets"
import { projectCode } from "@/lib/projects"
import { cn } from "@/lib/utils"

import { RouteArt } from "./route-art"

/**
 * The project's cover screenshot. Until the image exists in public/, the
 * project's generated route map stands in. Expects `--line` on an ancestor.
 */
export function ProjectCover({
  project,
  sizes,
  priority,
  className,
}: {
  project: Project
  sizes: string
  priority?: boolean
  className?: string
}) {
  const frame = cn("relative aspect-[16/10] overflow-hidden", className)

  if (hasPublicFile(project.cover.src)) {
    return (
      <div className={cn(frame, "bg-muted")}>
        <Image
          src={project.cover.src}
          alt={project.cover.alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-700 ease-glide group-hover:scale-[1.03]"
        />
      </div>
    )
  }

  return (
    <div
      aria-hidden
      className={frame}
      style={{ background: "color-mix(in oklch, var(--line) 7%, var(--card))" }}
    >
      <div className="absolute inset-0 transition-transform duration-700 ease-glide group-hover:scale-[1.04]">
        <RouteArt seed={project.slug} />
      </div>
      <span className="absolute top-3 left-3 rounded-md border bg-card/80 px-2 py-0.5 font-mono text-xs text-muted-foreground tabular-nums">
        {projectCode(project)}
      </span>
    </div>
  )
}
