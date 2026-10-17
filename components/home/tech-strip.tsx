import {
  IconBrandCloudflare,
  IconBrandDocker,
  IconBrandInertia,
  IconBrandLaravel,
  IconBrandMysql,
  IconBrandNextjs,
  IconBrandPhp,
  IconBrandReact,
  IconBrandTailwind,
  IconBrandTypescript,
  IconBrandVercel,
  IconCloud,
  IconCode,
  IconDatabase,
  IconSparkles,
  type Icon,
} from "@tabler/icons-react"

import { site } from "@/content/site"
import { cn } from "@/lib/utils"

// Tabler has no PostgreSQL, DigitalOcean or Claude marks; generic icons stand in.
const icons: Record<string, Icon> = {
  Laravel: IconBrandLaravel,
  PHP: IconBrandPhp,
  React: IconBrandReact,
  "Next.js": IconBrandNextjs,
  Inertia: IconBrandInertia,
  "Tailwind CSS": IconBrandTailwind,
  TypeScript: IconBrandTypescript,
  MySQL: IconBrandMysql,
  PostgreSQL: IconDatabase,
  Docker: IconBrandDocker,
  Cloudflare: IconBrandCloudflare,
  DigitalOcean: IconCloud,
  Vercel: IconBrandVercel,
  Claude: IconSparkles,
}

const items = site.skills.flatMap((group) =>
  group.items.map((name) => ({ name, Icon: icons[name] ?? IconCode }))
)

function Items({ hidden }: { hidden?: boolean }) {
  return (
    <ul
      aria-hidden={hidden}
      className={cn(
        "flex shrink-0 items-center gap-14 pr-14 motion-reduce:flex-wrap motion-reduce:gap-x-10 motion-reduce:gap-y-6 motion-reduce:pr-0",
        hidden && "motion-reduce:hidden"
      )}
    >
      {items.map(({ name, Icon }) => (
        <li
          key={name}
          className="flex items-center gap-3 whitespace-nowrap text-muted-foreground transition-colors duration-300 hover:text-foreground"
        >
          <Icon aria-hidden stroke={1.5} className="size-8" />
          <span className="text-xl font-bold tracking-tight">{name}</span>
        </li>
      ))}
    </ul>
  )
}

/**
 * The stack as a slow, monochrome logo strip. Pauses on hover and when
 * focused (keyboard); with reduced motion it stops and wraps.
 */
export function TechStrip() {
  return (
    <section
      aria-label={site.home.stripLabel}
      tabIndex={0}
      className="marquee mt-12 overflow-hidden rounded-lg py-3 mask-x-from-85% mask-x-to-100% motion-reduce:mask-none"
    >
      <div className="marquee-track flex w-max motion-reduce:w-auto">
        <Items />
        <Items hidden />
      </div>
    </section>
  )
}
