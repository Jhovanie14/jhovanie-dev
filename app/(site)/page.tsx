import { DeskSite, type ShotPaths } from "@/components/desk/desk-site"
import { site } from "@/content/site"
import { hasPublicFile, imageSize, isLinkAvailable } from "@/lib/assets"
import { buildInfo } from "@/lib/build-info"

export default function HomePage() {
  // Each project's screenshots for the monitor: the cover, then the gallery, only files that exist in public/,
  // with their pixel sizes for the full-size viewer.
  const shots: ShotPaths[] = site.projects.map((p) =>
    [p.cover, ...p.gallery].filter((img) => hasPublicFile(img.src)).map(({ src, alt }) => ({ src, alt, ...imageSize(src) }))
  )

  return <DeskSite cv={site.cvUrl && isLinkAvailable(site.cvUrl) ? site.cvUrl : null} build={buildInfo().commit} shots={shots} />
}
