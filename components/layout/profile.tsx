import Image from "next/image"

import { site } from "@/content/site"
import { cn } from "@/lib/utils"

const sizes = {
  sm: { px: 32, className: "size-8 ring-offset-2" },
  xl: { px: 112, className: "size-28 ring-offset-4" },
}

export function Avatar({ size, priority }: { size: keyof typeof sizes; priority?: boolean }) {
  const { px, className } = sizes[size]

  return (
    <Image
      src={site.avatar.src}
      alt={site.avatar.alt}
      width={px}
      height={px}
      priority={priority}
      className={cn(
        "shrink-0 rounded-full object-cover ring-2 ring-line-1 ring-offset-sidebar",
        className
      )}
    />
  )
}

/** Compact row for the mobile top bar. */
export function ProfileRow() {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar size="sm" />
      <p className="truncate text-sm leading-tight font-semibold">{site.name}</p>
    </div>
  )
}

/** Centered profile for the sidebar and the mobile sheet. */
export function ProfileCard({ priority }: { priority?: boolean }) {
  return (
    <div className="flex flex-col items-center text-center">
      <Avatar size="xl" priority={priority} />
      <p className="mt-5 text-lg leading-tight font-semibold">{site.name}</p>
      <p className="mt-1 text-sm text-muted-foreground">{site.role}</p>
    </div>
  )
}
