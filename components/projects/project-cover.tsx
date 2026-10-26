import Image from "next/image"

import { site, type Project } from "@/content/site"
import { hasPublicFile } from "@/lib/assets"
import { cn } from "@/lib/utils"

/**
 * The project's cover screenshot. Until the image exists in public/, a plain
 * surface says so: nothing is drawn to look like a screenshot it isn't.
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
  const frame = cn("relative aspect-[4/3] overflow-hidden rounded-lg bg-surface", className)

  if (hasPublicFile(project.cover.src)) {
    return (
      <div className={frame}>
        <Image src={project.cover.src} alt={project.cover.alt} fill sizes={sizes} priority={priority} className="object-cover" />
      </div>
    )
  }

  return (
    <div className={cn(frame, "flex flex-col justify-end p-5")}>
      <p className="font-medium">{project.title}</p>
      <p className="text-small text-muted-foreground">{site.projectsPage.pending}</p>
    </div>
  )
}
