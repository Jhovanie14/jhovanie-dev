import type { Metadata } from "next"

import { Contact } from "@/components/home/contact"
import { BookCall } from "@/components/layout/book-call"
import { PageTransition } from "@/components/layout/page-transition"
import { Reveal } from "@/components/motion/reveal"
import { RiseText } from "@/components/motion/rise-text"
import { ProjectCover } from "@/components/projects/project-cover"
import { site } from "@/content/site"

const { title, intro, labels, empty } = site.projectsPage

export const metadata: Metadata = { title, description: intro }

export default function ProjectsPage() {
  const projects = [...site.projects].sort((a, b) => b.year - a.year)

  return (
    <PageTransition>
      <header className="frame pt-[12svh] lg:pt-[16svh]">
        <div className="lg:pl-[16%]">
          <RiseText as="h1" text={title} by="chars" onLoad className="display" />
          <p className="column mt-6 text-lead">{intro}</p>
        </div>
      </header>

      <div className="frame pt-24 lg:pt-32">
        {projects.length === 0 ? (
          <div className="column rounded-xl bg-surface p-8 lg:ml-[16%]">
            <h2 className="text-heading font-medium">{empty.title}</h2>
            <p className="mt-3 text-muted-foreground">{empty.body}</p>
            <BookCall className="mt-6" />
          </div>
        ) : (
          <ol className="flex flex-col gap-28 lg:gap-36">
            {projects.map((project, i) => {
              const rows = [
                { term: labels.role, detail: project.role },
                { term: labels.stack, detail: project.stack.join(", ") },
              ]

              return (
                <li key={project.slug} id={project.slug} className="scroll-mt-24">
                  <Reveal className="grid gap-8 lg:grid-cols-[16%_minmax(0,40rem)_minmax(0,1fr)] lg:gap-0">
                    <p className="text-small text-muted-foreground tabular-nums lg:pt-2">{project.year}</p>
                    <div>
                      <h2 className="text-heading font-medium">{project.title}</h2>
                      <p className="mt-3">{project.summary}</p>
                      <dl className="mt-6 grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-2 text-small">
                        {rows.map(({ term, detail }) => (
                          <div key={term} className="contents">
                            <dt className="text-muted-foreground">{term}</dt>
                            <dd>{detail}</dd>
                          </div>
                        ))}
                      </dl>
                      <p className="mt-6">
                        <span className="text-small text-muted-foreground">{labels.outcome}</span>
                        <span className="mt-1 block font-medium">{project.outcome}</span>
                      </p>
                    </div>
                    <ProjectCover
                      project={project}
                      priority={i === 0}
                      sizes="(min-width: 1024px) 28vw, 100vw"
                      className="lg:ml-12"
                    />
                  </Reveal>
                </li>
              )
            })}
          </ol>
        )}
      </div>

      <Contact />
    </PageTransition>
  )
}
