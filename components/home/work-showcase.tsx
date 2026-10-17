import Link from "next/link"
import { IconArrowRight } from "@tabler/icons-react"

import { CtaPill } from "@/components/cta-pill"
import { ProjectCover } from "@/components/projects/project-cover"
import { SectionHeader } from "@/components/section-header"
import { site, type Project } from "@/content/site"
import { navTransition } from "@/lib/navigation"
import { featuredProjects, projectCode, projectLine } from "@/lib/projects"

import { ShowcaseCarousel } from "./showcase-carousel"

function Slide({ project }: { project: Project }) {
  const { caseStudy, liveSite, roleLabel, yearLabel } = site.home.work
  const rows = [
    { term: roleLabel, detail: project.role },
    { term: yearLabel, detail: String(project.year) },
    { term: site.ui.stack, detail: project.stack.join(", ") },
  ]

  return (
    <article
      aria-labelledby={`showcase-${project.slug}`}
      style={{ "--line": projectLine(project), "--edge": projectLine(project) } as React.CSSProperties}
      className="edge-light grid gap-8 rounded-2xl border bg-card p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-center lg:gap-12"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-md border px-2 py-1 font-mono text-xs text-muted-foreground tabular-nums">
            <span aria-hidden className="size-2 rounded-full bg-(--line)" />
            {projectCode(project)}
          </span>
          {project.placeholder && (
            <span className="rounded-sm bg-warning px-1.5 py-px text-xs font-semibold text-primary-foreground">
              {site.ui.placeholder}
            </span>
          )}
        </div>
        <h3
          id={`showcase-${project.slug}`}
          className="mt-5 text-3xl font-medium tracking-[-0.03em] text-balance sm:text-4xl"
        >
          {project.title}
        </h3>
        <p className="mt-3 max-w-[46ch] leading-relaxed text-muted-foreground">{project.summary}</p>

        <dl className="mt-6">
          {rows.map(({ term, detail }) => (
            <div
              key={term}
              className="flex justify-between gap-6 border-b border-dashed py-3 text-sm last:border-b-0"
            >
              <dt className="font-medium">{term}</dt>
              <dd className="text-right text-muted-foreground">{detail}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-7 flex flex-wrap gap-3">
          <CtaPill href={`/projects/${project.slug}`} from="/" variant="outline">
            {caseStudy}
          </CtaPill>
          {project.links.live && (
            <CtaPill href={project.links.live} variant="outline">
              {liveSite}
            </CtaPill>
          )}
        </div>
      </div>

      <ProjectCover
        project={project}
        sizes="(min-width: 1024px) 40vw, 100vw"
        className="rounded-xl border"
      />
    </article>
  )
}

/** Featured projects, one at a time, with previous / next controls. */
export function WorkShowcase() {
  const { label, title, allLabel, previous, next, max } = site.home.work
  const projects = featuredProjects(max)

  if (projects.length === 0) return null

  return (
    <section aria-labelledby="work-title" className="mt-28">
      <SectionHeader id="work-title" label={label} title={title} />

      <ShowcaseCarousel
        className="mt-10"
        labels={{ previous, next, region: title }}
        titles={projects.map((p) => p.title)}
        slides={projects.map((project) => (
          <Slide key={project.slug} project={project} />
        ))}
        footer={
          <Link
            href="/projects"
            transitionTypes={navTransition("/", "/projects")}
            className="group/all inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            {allLabel}
            <IconArrowRight
              aria-hidden
              stroke={1.75}
              className="size-4 transition-transform duration-300 ease-glide group-hover/all:translate-x-0.5"
            />
          </Link>
        }
      />
    </section>
  )
}
