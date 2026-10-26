"use client"

import { useRef } from "react"
import Link from "next/link"

import { ease, fullMotion, gsap, revealStart, stagger, useGSAP } from "@/lib/motion"
import { navTransition } from "@/lib/navigation"

export type WorkItem = {
  slug: string
  href: string
  title: string
  summary: string
  outcome: string
  role: string
  year: number
  stack: string[]
  line: string
  /** Server-rendered <ProjectCover>, sized to fill its frame. */
  cover: React.ReactNode
}

type Labels = { role: string; year: string; stack: string; view: string }

const FROM = "/projects"

/**
 * The work index: two projects per row, the right column set lower for a
 * staggered rhythm on large screens. One column on small screens.
 * Each cover opens from the bottom as it enters and its picture settles;
 * then the caption arrives line by line. Once, and static without motion.
 */
export function WorkIndex({ items, labels }: { items: WorkItem[]; labels: Labels }) {
  const scope = useRef<HTMLOListElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(fullMotion, () => {
        gsap.utils.toArray<HTMLElement>("[data-project]").forEach((project) => {
          const frame = project.querySelector("[data-reveal]")
          const tl = gsap.timeline({ scrollTrigger: { trigger: project, start: revealStart, once: true } })
          tl.set(frame, { visibility: "visible" })
            .fromTo(
              frame,
              { clipPath: "inset(16% 0% 0% 0% round 1rem)" },
              { clipPath: "inset(0% 0% 0% 0% round 1rem)", duration: 1.1, ease: ease.inOut, clearProps: "clipPath" }
            )
            .fromTo(
              project.querySelector("[data-picture]"),
              { scale: 1.08 },
              { scale: 1, duration: 1.3, ease: ease.expo, clearProps: "transform" },
              0
            )
            .fromTo(
              project.querySelectorAll("[data-caption] > *"),
              { opacity: 0, y: 16 },
              { opacity: 1, y: 0, duration: 0.7, ease: ease.out, stagger: stagger.item },
              0.35
            )
        })
      })
      return () => mm.revert()
    },
    { scope }
  )

  return (
    <ol
      ref={scope}
      className="grid gap-x-8 gap-y-20 md:grid-cols-2 lg:gap-x-10 lg:gap-y-28 lg:[&>li:nth-child(even)]:mt-28"
    >
      {items.map((item) => {
        const transitionTypes = navTransition(FROM, item.href)

        return (
          <li
            key={item.slug}
            data-project
            className="group/project"
            style={{ "--line": item.line } as React.CSSProperties}
          >
            <Link href={item.href} transitionTypes={transitionTypes} tabIndex={-1} aria-hidden className="group block">
              <div data-reveal className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-card">
                <div data-picture className="absolute inset-0">
                  <div className="absolute inset-0 transition-transform duration-700 ease-glide group-hover/project:scale-[1.03] motion-reduce:transition-none">
                    {item.cover}
                  </div>
                </div>
              </div>
            </Link>

            <div data-caption className="mt-6">
              <div className="flex items-baseline justify-between gap-6">
                <h2 className="text-lead font-semibold text-balance">
                  <Link
                    href={item.href}
                    transitionTypes={transitionTypes}
                    className="transition-colors duration-200 hover:text-(--line) group-hover/project:text-(--line)"
                  >
                    {item.title}
                  </Link>
                </h2>
                <span className="shrink-0 text-small text-muted-foreground tabular-nums">{item.year}</span>
              </div>

              <p className="mt-3 line-clamp-2 text-muted-foreground">{item.summary}</p>
              <p className="mt-2 line-clamp-2">{item.outcome}</p>

              <dl className="mt-5 grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-1.5 text-small">
                <dt className="text-muted-foreground">{labels.role}</dt>
                <dd className="truncate">{item.role}</dd>
                <dt className="text-muted-foreground">{labels.stack}</dt>
                <dd className="truncate">{item.stack.join(", ")}</dd>
              </dl>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
