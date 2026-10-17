import type { Metadata } from "next"

import { CtaPill } from "@/components/cta-pill"
import { PageTransition } from "@/components/layout/page-transition"
import { ProjectCover } from "@/components/projects/project-cover"
import { ProjectsExplorer, type ExplorerItem } from "@/components/projects/projects-explorer"
import { RiseTitle } from "@/components/rise-title"
import { SectionLabel } from "@/components/section-header"
import { site } from "@/content/site"
import { projectCode, projectLine } from "@/lib/projects"

const { label, title, intro, empty } = site.projectsPage

export const metadata: Metadata = { title, description: intro }

export default function ProjectsPage() {
  const projects = site.projects

  const items: ExplorerItem[] = projects.map((project, i) => ({
    slug: project.slug,
    href: `/projects/${project.slug}`,
    title: project.title,
    summary: project.summary,
    role: project.role,
    year: project.year,
    stack: project.stack,
    code: projectCode(project),
    line: projectLine(project),
    placeholder: project.placeholder,
    cover: (
      <ProjectCover
        project={project}
        priority={i === 0}
        sizes="(min-width: 1024px) 55vw, 100vw"
        className="aspect-auto size-full"
      />
    ),
  }))

  const header = (
    <>
      <SectionLabel>{label}</SectionLabel>
      <RiseTitle
        text={title}
        className="mt-6 flex items-start text-6xl leading-[0.95] font-bold tracking-[-0.045em] sm:text-7xl xl:text-8xl"
      >
        <sup className="mt-2 ml-3 font-mono text-base font-medium tracking-normal text-line-1 tabular-nums sm:text-lg">
          ({String(projects.length).padStart(2, "0")})
        </sup>
      </RiseTitle>
      <p className="mt-6 max-w-[56ch] text-lg leading-relaxed text-muted-foreground">{intro}</p>
    </>
  )

  return (
    <PageTransition>
      {projects.length === 0 ? (
        <>
          <div className="edge-light rounded-2xl border bg-card p-6 sm:p-10 lg:p-12">{header}</div>
          <div className="mt-5 rounded-2xl border border-dashed p-8 text-center sm:p-14">
            <h2 className="text-2xl font-medium tracking-[-0.02em]">{empty.title}</h2>
            <p className="mx-auto mt-3 max-w-[44ch] leading-relaxed text-muted-foreground">{empty.body}</p>
            <CtaPill href={site.bookingUrl} className="mt-7">
              {site.cta.book}
            </CtaPill>
          </div>
        </>
      ) : (
        <ProjectsExplorer items={items} header={header} />
      )}
    </PageTransition>
  )
}
