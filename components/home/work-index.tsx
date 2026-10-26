import Link from "next/link"

import { Reveal } from "@/components/motion/reveal"
import { RiseText } from "@/components/motion/rise-text"
import { ProjectCover } from "@/components/projects/project-cover"
import { site } from "@/content/site"
import { navTransition } from "@/lib/navigation"
import { featuredProjects, projectLine } from "@/lib/projects"

import { WorkNames, type WorkName } from "./work-names"

/** Selected work: the featured projects as an index of big names with a held preview. */
export function WorkIndex() {
  const { title, allLabel, max } = site.home.work
  const projects = featuredProjects(max)

  if (projects.length === 0) return null

  const items: WorkName[] = projects.map((project, i) => ({
    slug: project.slug,
    href: `/projects/${project.slug}`,
    title: project.title,
    role: project.role,
    year: project.year,
    line: projectLine(project),
    cover: (
      <ProjectCover
        project={project}
        priority={i === 0}
        fine
        sizes="(min-width: 1024px) 30vw, 100vw"
        className="size-full lg:aspect-auto"
      />
    ),
  }))

  return (
    <section aria-labelledby="work-title" className="frame pt-32 lg:pt-48">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <RiseText id="work-title" text={title} className="text-heading font-light" />
        <Link
          href="/projects"
          transitionTypes={navTransition("/", "/projects")}
          className="group inline-flex items-center gap-2 font-semibold"
        >
          {allLabel}
          <span aria-hidden className="transition-transform duration-300 ease-glide group-hover:translate-x-1">
            →
          </span>
        </Link>
      </div>

      <Reveal className="mt-12 lg:mt-16" each={0}>
        <WorkNames items={items} />
      </Reveal>
    </section>
  )
}
