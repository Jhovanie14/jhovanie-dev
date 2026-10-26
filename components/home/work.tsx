import Link from "next/link"

import { Reveal } from "@/components/motion/reveal"
import { RiseText } from "@/components/motion/rise-text"
import { site } from "@/content/site"
import { navTransition } from "@/lib/navigation"
import { featuredProjects } from "@/lib/projects"

/** Selected work as a parts list: one row per project, each opening its assembly on the Work page. */
export function Work() {
  const { title, all } = site.home.work
  const projects = featuredProjects(6)
  if (projects.length === 0) return null

  return (
    <section aria-labelledby="work-title" className="frame pt-32 lg:pt-44">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <RiseText id="work-title" text={title} className="text-heading font-semibold" />
        <Link href="/projects" transitionTypes={navTransition("/", "/projects")} className="link font-semibold">
          {all} →
        </Link>
      </div>
      <Reveal className="mt-8 flex flex-col">
        {projects.map((p) => (
          <Link
            key={p.slug}
            href={`/projects#${p.slug}`}
            transitionTypes={navTransition("/", "/projects")}
            className="group grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-6 gap-y-1 bg-card px-5 py-5 transition-colors duration-200 hover:bg-popover sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_auto] [&+&]:mt-1"
          >
            <span className="text-lead font-semibold group-hover:text-accent-ink">{p.title}</span>
            <span className="col-span-2 row-start-2 text-muted-foreground sm:col-span-1 sm:row-start-auto">{p.role}</span>
            <span className="col-start-2 row-start-1 text-muted-foreground tabular-nums sm:col-start-auto sm:row-start-auto">{p.year}</span>
          </Link>
        ))}
      </Reveal>
    </section>
  )
}
