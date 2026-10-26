import type { Metadata } from "next"

import { Assembly, type Part } from "@/components/assembly/assembly"
import { Contact } from "@/components/home/contact"
import { BookCall } from "@/components/layout/book-call"
import { PageTransition } from "@/components/layout/page-transition"
import { RiseText } from "@/components/motion/rise-text"
import { site, type Project } from "@/content/site"

const { title, intro, labels, empty } = site.projectsPage

export const metadata: Metadata = { title, description: intro }

// A project as an assembly: the problem at the base, the outcome on top.
function partsOf(p: Project): Part[] {
  const names = site.assembly.project
  return [
    { id: "problem", title: names.problem, detail: p.problem },
    { id: "solution", title: names.solution, detail: p.solution },
    { id: "stack", title: names.stack, caption: p.stack.join(" · "), detail: p.stack.join(", ") },
    { id: "outcome", title: names.outcome, detail: p.outcome },
  ]
}

export default function ProjectsPage() {
  const projects = [...site.projects].sort((a, b) => b.year - a.year)

  return (
    <PageTransition>
      <header className="frame pt-16 lg:pt-24">
        <RiseText as="h1" text={title} by="chars" onLoad className="display" />
        <p className="mt-5 max-w-[48ch] text-lead">{intro}</p>
      </header>

      <div className="frame flex flex-col gap-28 pt-20 lg:gap-40 lg:pt-28">
        {projects.length === 0 ? (
          <div className="max-w-xl bg-card p-8">
            <h2 className="text-lead font-semibold">{empty.title}</h2>
            <p className="mt-3 text-muted-foreground">{empty.body}</p>
            <BookCall className="mt-6" />
          </div>
        ) : (
          projects.map((p, i) => (
            <article key={p.slug} id={p.slug} aria-labelledby={`${p.slug}-title`} className="scroll-mt-24">
              <Assembly parts={partsOf(p)} label={p.title} reverse={i % 2 === 1} details="always">
                <h2 id={`${p.slug}-title`} className="flex flex-wrap items-baseline justify-between gap-x-4 text-heading font-semibold text-balance">
                  {p.title}
                  <span className="text-small font-normal text-muted-foreground tabular-nums">{p.year}</span>
                </h2>
                <p className="mt-4 max-w-[48ch]">{p.summary}</p>
                <p className="mt-3 text-small">
                  <span className="text-muted-foreground">{labels.role}</span> {p.role}
                </p>
              </Assembly>
            </article>
          ))
        )}
      </div>

      <Contact />
    </PageTransition>
  )
}
