import Link from "next/link"

import { Assembly, type Part } from "@/components/assembly/assembly"
import { BookCall } from "@/components/layout/book-call"
import { RiseText } from "@/components/motion/rise-text"
import { site } from "@/content/site"
import { navTransition } from "@/lib/navigation"

// The stack, base to top: the order a request climbs out of the database.
const order = ["data", "api", "interface", "edge"] as const
const parts: Part[] = order.map((layer) => {
  const g = site.skills.find((s) => s.layer === layer)!
  return { id: layer, title: g.group, caption: g.items.join(" · "), detail: `${g.items.join(", ")}. ${g.note ?? ""}` }
})

/** The first screen: the stack as an exploded assembly, held while it comes apart. */
export function Hero() {
  return (
    <div className="frame pt-6 lg:pt-0">
      <Assembly parts={parts} label={site.assembly.stack} hold>
        <RiseText as="h1" text={site.name} by="chars" onLoad className="display" />
        <p className="mt-5 max-w-[34ch] text-lead">
          {site.role}. {site.home.intro}
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
          <BookCall className="h-12 px-6 text-body" />
          <Link href="/projects" transitionTypes={navTransition("/", "/projects")} className="link font-semibold">
            {site.cta.work} →
          </Link>
        </div>
        <p className="mt-8 text-small text-muted-foreground">{site.assembly.hint}</p>
      </Assembly>
    </div>
  )
}
