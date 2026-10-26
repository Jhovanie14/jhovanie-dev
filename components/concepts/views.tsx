"use client"

import { useLayoutEffect, useRef, useState } from "react"

import { site } from "@/content/site"
import { Flip, gsap } from "@/lib/gsap-concepts"
import { cn } from "@/lib/utils"

/*
 * Concept: Two views. A Swiss grid that answers its reader. One switch,
 * Hiring or Have a project, and the same blocks re-span and re-order for
 * that reader with a FLIP morph you can watch. White, black, one red.
 */

type View = "hiring" | "project"
type Block = { id: string; span: Record<View, string | null>; render: (view: View) => React.ReactNode }

const RED = "#E30613"
const label = "text-[14px] font-semibold tracking-[0.02em]"

const blocks: Block[] = [
  {
    id: "pitch",
    span: { hiring: "lg:col-span-8", project: "lg:col-span-7" },
    render: (v) => (
      <p className="text-[clamp(1.75rem,3.4vw,3rem)] leading-[1.05] font-semibold tracking-[-0.02em]">
        {v === "hiring" ? `${site.role}. ${site.yearsOfExperience} years shipping full-stack products. ${site.availability.label}.` : `Have a project? ${site.bio.short}`}
      </p>
    ),
  },
  {
    id: "book",
    span: { hiring: "lg:col-span-4", project: "lg:col-span-5" },
    render: (v) => (
      <div className="flex h-full flex-col justify-between gap-6">
        <p className={label}>{v === "hiring" ? "Talk to me" : "Start here"}</p>
        <a
          href={site.bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-14 w-fit items-center px-7 text-[1.125rem] font-semibold text-white transition-transform duration-150 active:scale-[0.97]"
          style={{ background: RED }}
        >
          {site.cta.book}
        </a>
      </div>
    ),
  },
  {
    id: "experience",
    span: { hiring: "lg:col-span-7", project: "lg:col-span-4" },
    render: () => (
      <div>
        <p className={label}>Experience</p>
        <ul className="mt-3 flex flex-col gap-3">
          {site.experience.map((e) => (
            <li key={e.title + e.start}>
              <p className="text-[1.25rem] font-semibold">{e.title}</p>
              <p className="text-[16px]">
                {e.company} · {e.start.slice(0, 4)}–{e.end === "present" ? "now" : e.end.slice(0, 4)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    id: "stack",
    span: { hiring: "lg:col-span-5", project: "lg:col-span-4" },
    render: () => (
      <div>
        <p className={label}>Stack</p>
        <dl className="mt-3 flex flex-col gap-2 text-[16px]">
          {site.skills.map((g) => (
            <div key={g.group} className="grid grid-cols-[7rem_minmax(0,1fr)] gap-3">
              <dt className="font-semibold">{g.group}</dt>
              <dd>{g.items.join(", ")}</dd>
            </div>
          ))}
        </dl>
      </div>
    ),
  },
  {
    id: "services",
    span: { hiring: null, project: "lg:col-span-8" },
    render: () => (
      <div>
        <p className={label}>What I build</p>
        <ul className="mt-3 grid gap-4 sm:grid-cols-2">
          {site.services.map((s) => (
            <li key={s.title}>
              <p className="text-[1.25rem] font-semibold">{s.title}</p>
              <p className="text-[16px]">{s.description}</p>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    id: "process",
    span: { hiring: null, project: "lg:col-span-12" },
    render: () => (
      <div>
        <p className={label}>How it runs</p>
        <ol className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {site.process.map((p) => (
            <li key={p.title}>
              <p className="text-[1.25rem] font-semibold">{p.title}</p>
              <p className="text-[16px]">
                <span style={{ color: RED }}>{p.when}.</span> {p.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    ),
  },
  {
    id: "links",
    span: { hiring: "lg:col-span-12", project: null },
    render: () => (
      <div className="flex flex-wrap items-baseline gap-x-10 gap-y-3">
        <p className={label}>Profiles</p>
        {[...site.socials, { label: "Email", href: `mailto:${site.email}` }].map((s) => (
          <a key={s.label} href={s.href} className="text-[clamp(1.5rem,2.6vw,2.25rem)] font-semibold underline decoration-2 underline-offset-[0.15em] hover:decoration-[#E30613]">
            {s.label}
          </a>
        ))}
      </div>
    ),
  },
]

export function Views() {
  const [view, setView] = useState<View>("hiring")
  const grid = useRef<HTMLDivElement>(null)
  const flip = useRef<Flip.FlipState | null>(null)

  function choose(next: View) {
    if (next === view) return
    flip.current = Flip.getState("[data-block]")
    setView(next)
  }

  // After React re-lays the grid, morph every block from where it was.
  useLayoutEffect(() => {
    if (!flip.current) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    Flip.from(flip.current, {
      duration: reduce ? 0 : 0.75,
      ease: "expo.inOut",
      absolute: true,
      stagger: 0.03,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.35 }),
      onLeave: (els) => gsap.to(els, { opacity: 0, duration: 0.25 }),
    })
    flip.current = null
  }, [view])

  return (
    <div className="min-h-svh bg-white pt-11 font-[family-name:var(--font-hanken)] text-black selection:bg-[#E30613] selection:text-white">
      <div className="mx-auto max-w-[96rem] px-5 pt-8 pb-24 sm:px-10">
        <header className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <h1 className="text-[clamp(3.25rem,9vw,8.5rem)] leading-[0.86] font-bold tracking-[-0.045em] lg:col-span-8">{site.name}</h1>
          <div role="radiogroup" aria-label="I am" className="flex w-fit bg-black p-1 lg:col-span-4 lg:justify-self-end">
            {(
              [
                ["hiring", "I'm hiring"],
                ["project", "I have a project"],
              ] as const
            ).map(([id, text]) => (
              <button
                key={id}
                role="radio"
                aria-checked={view === id}
                onClick={() => choose(id)}
                className={cn("h-12 px-5 text-[1.0625rem] font-semibold transition-colors duration-200", view === id ? "bg-white text-black" : "text-white hover:text-[#E30613]")}
              >
                {text}
              </button>
            ))}
          </div>
        </header>

        <div ref={grid} className="mt-10 grid gap-x-6 gap-y-14 lg:grid-cols-12">
          {blocks
            .filter((b) => b.span[view] !== null)
            .sort((a, b) => order[view].indexOf(a.id) - order[view].indexOf(b.id))
            .map((b) => (
              <section key={b.id} data-block data-flip-id={b.id} aria-label={b.id} className={cn("border-t-[6px] border-black pt-4", b.span[view])}>
                {b.render(view)}
              </section>
            ))}
        </div>
      </div>
    </div>
  )
}

const order: Record<View, string[]> = {
  hiring: ["pitch", "book", "experience", "stack", "links"],
  project: ["pitch", "book", "services", "experience", "stack", "process"],
}
