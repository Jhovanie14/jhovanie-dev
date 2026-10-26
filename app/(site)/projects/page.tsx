import type { Metadata } from "next"
import Link from "next/link"
import { IconArrowUpRight } from "@tabler/icons-react"

import { CtaPill } from "@/components/cta-pill"
import { PageTransition } from "@/components/layout/page-transition"
import { ProjectCover } from "@/components/projects/project-cover"
import { WorkIndex, type WorkItem } from "@/components/projects/work-index"
import { site } from "@/content/site"
import { navTransition } from "@/lib/navigation"
import { projectLine } from "@/lib/projects"

const { title, intro, count, labels, view, cta, empty } = site.projectsPage

export const metadata: Metadata = { title, description: intro }

export default function ProjectsPage() {
  const projects = [...site.projects].sort((a, b) => b.year - a.year)
  const years = projects.map((p) => p.year)
  const span =
    years.length === 0
      ? ""
      : Math.min(...years) === Math.max(...years)
        ? `${Math.max(...years)}`
        : `${Math.min(...years)}–${Math.max(...years)}`

  const items: WorkItem[] = projects.map((project, i) => ({
    slug: project.slug,
    href: `/projects/${project.slug}`,
    index: String(i + 1).padStart(2, "0"),
    title: project.title,
    summary: project.summary,
    outcome: project.outcome,
    role: project.role,
    year: project.year,
    stack: project.stack,
    line: projectLine(project),
    cover: (
      <ProjectCover
        project={project}
        priority={i < 2}
        fine
        sizes="(min-width: 1024px) 36vw, (min-width: 768px) 50vw, 100vw"
        className="aspect-auto size-full"
      />
    ),
  }))

  return (
    <PageTransition>
      {/* Header: oversized title against a short intro, on a 12-column grid. */}
      <header className="grid gap-8 pt-4 lg:grid-cols-12 lg:items-end lg:gap-6 lg:pt-14">
        <h1 className="overflow-hidden pb-[0.06em] text-[clamp(4rem,11vw,9.5rem)] leading-[0.85] font-bold tracking-[-0.055em] lg:col-span-7">
          <span
            className="rise-letter inline-block"
            style={{ animation: "rise 1s var(--ease-glide) 80ms both" }}
          >
            {title}
          </span>
        </h1>
        <div className="lg:col-span-4 lg:col-start-9 lg:pb-3">
          <p className="text-lg leading-relaxed text-muted-foreground">{intro}</p>
          {projects.length > 0 && (
            <p className="mt-5 font-mono text-sm text-muted-foreground tabular-nums">
              {String(projects.length).padStart(2, "0")} {count} · {span}
            </p>
          )}
        </div>
      </header>

      <div className="mt-12 h-px bg-border lg:mt-16" />

      <div className="mt-16 lg:mt-24">
        {projects.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-10">
            <h2 className="text-2xl font-semibold tracking-tight">{empty.title}</h2>
            <p className="mt-3 max-w-md leading-relaxed text-muted-foreground">{empty.body}</p>
            <CtaPill href={site.bookingUrl} className="mt-7">
              {site.cta.book}
            </CtaPill>
          </div>
        ) : (
          <WorkIndex items={items} labels={{ ...labels, view }} />
        )}
      </div>

      {/* Closing: one big line to the next step. */}
      <section aria-label={cta.title} className="mt-32 border-t pt-14 lg:mt-48 lg:grid lg:grid-cols-12 lg:gap-6 lg:pt-20">
        <p className="text-lg text-muted-foreground lg:col-span-4">{cta.lead}</p>
        <Link
          href="/contact"
          transitionTypes={navTransition("/projects", "/contact")}
          className="group/cta mt-4 inline-flex items-center gap-5 text-[clamp(2.5rem,6vw,5.5rem)] leading-none font-semibold tracking-[-0.045em] lg:col-span-8 lg:mt-0"
        >
          <span className="transition-colors duration-500 group-hover/cta:text-line-1">{cta.title}</span>
          <span
            aria-hidden
            className="grid size-[0.9em] shrink-0 place-items-center rounded-full border transition-all duration-500 ease-glide group-hover/cta:rotate-45 group-hover/cta:border-line-1 group-hover/cta:bg-line-1 group-hover/cta:text-primary-foreground"
          >
            <IconArrowUpRight stroke={1.75} className="size-[0.5em]" />
          </span>
        </Link>
      </section>
    </PageTransition>
  )
}
