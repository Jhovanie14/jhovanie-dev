import type { Metadata } from "next"

import { ContactCoupon } from "@/components/home/contact-coupon"
import { BookCall } from "@/components/layout/book-call"
import { PageTransition } from "@/components/layout/page-transition"
import { RiseText } from "@/components/motion/rise-text"
import { ProjectCover } from "@/components/projects/project-cover"
import { WorkIndex, type WorkItem } from "@/components/projects/work-index"
import { site } from "@/content/site"
import { projectLine } from "@/lib/projects"

const { title, intro, count, labels, view, empty } = site.projectsPage

export const metadata: Metadata = { title, description: intro }

export default function ProjectsPage() {
  const projects = [...site.projects].sort((a, b) => b.year - a.year)
  const years = projects.map((p) => p.year)
  const span =
    years.length === 0
      ? ""
      : Math.min(...years) === Math.max(...years)
        ? `${Math.max(...years)}`
        : `${Math.min(...years)} to ${Math.max(...years)}`

  const items: WorkItem[] = projects.map((project, i) => ({
    slug: project.slug,
    href: `/projects/${project.slug}`,
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
        sizes="(min-width: 1024px) 44vw, (min-width: 768px) 50vw, 100vw"
        className="aspect-auto size-full"
      />
    ),
  }))

  return (
    <PageTransition>
      {/* Header: oversized title against a short intro, on a 12-column grid. */}
      <header className="frame grid gap-8 pt-10 lg:grid-cols-12 lg:items-end lg:gap-6 lg:pt-16">
        <div className="lg:col-span-6">
          <RiseText as="h1" text={title} by="chars" onLoad className="display pb-[0.06em]" />
        </div>
        <div className="lg:col-span-5 lg:col-start-8 lg:pb-3">
          <p className="text-lead text-balance">{intro}</p>
          {projects.length > 0 && (
            <p className="mt-4 text-small text-muted-foreground">
              {projects.length} {count}, {span}
            </p>
          )}
        </div>
      </header>

      <div className="frame mt-20 lg:mt-28">
        {projects.length === 0 ? (
          <div className="rounded-2xl bg-card p-10">
            <h2 className="text-lead font-semibold">{empty.title}</h2>
            <p className="mt-3 max-w-md text-muted-foreground">{empty.body}</p>
            <BookCall className="mt-7" />
          </div>
        ) : (
          <WorkIndex items={items} labels={{ ...labels, view }} />
        )}
      </div>

      <ContactCoupon from="/projects" />
    </PageTransition>
  )
}
