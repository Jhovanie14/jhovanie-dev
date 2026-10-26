import Link from "next/link"

import { Reveal } from "@/components/motion/reveal"
import { RiseText } from "@/components/motion/rise-text"
import { ProjectCover } from "@/components/projects/project-cover"
import { site } from "@/content/site"
import { navTransition } from "@/lib/navigation"
import { featuredProjects } from "@/lib/projects"

import { WorkLedger, type LedgerRow } from "./work-ledger"

/** Selected work as a quiet ledger. Rows open the project on the Work page. */
export function Work() {
  const { title, all } = site.home.work
  const projects = featuredProjects(6)
  if (projects.length === 0) return null

  const rows: LedgerRow[] = projects.map((project, i) => ({
    slug: project.slug,
    href: `/projects#${project.slug}`,
    title: project.title,
    kind: project.role,
    year: project.year,
    cover: <ProjectCover project={project} sizes="(min-width: 1024px) 18rem, 100vw" priority={i === 0} />,
  }))

  return (
    <section aria-labelledby="work-title" className="frame pt-32 lg:pt-44">
      <div className="lg:pl-[16%]">
        <div className="column flex items-baseline justify-between gap-6">
          <RiseText id="work-title" text={title} className="text-heading font-medium" />
          <Link href="/projects" transitionTypes={navTransition("/", "/projects")} className="link text-small font-medium">
            {all} →
          </Link>
        </div>
        <Reveal className="mt-8" each={0}>
          <WorkLedger rows={rows} />
        </Reveal>
      </div>
    </section>
  )
}
