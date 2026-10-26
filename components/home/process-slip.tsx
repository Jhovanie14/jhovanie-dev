import { useId } from "react"

import { Reveal } from "@/components/motion/reveal"
import { RiseText } from "@/components/motion/rise-text"
import { CutEdge } from "@/components/stationery"
import { site } from "@/content/site"

/** Round dots leading the eye from a stop to its time, like a printed timetable. */
function Leader() {
  const id = useId()

  return (
    <svg aria-hidden height="4" className="mb-1.5 w-0 min-w-6 flex-1 self-end text-muted-foreground/60">
      <defs>
        <pattern id={id} width="10" height="4" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="2" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="4" fill={`url(#${id})`} />
    </svg>
  )
}

/**
 * How a project runs, printed as a timetable slip: each stop with its time,
 * and the last row inverted to say what you hold at the end.
 */
export function ProcessSlip() {
  const { title, body, result } = site.home.process

  if (site.process.length === 0) return null

  return (
    <section aria-labelledby="process-title" className="frame pt-32 lg:pt-48">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-5">
          <RiseText id="process-title" text={title} className="text-heading font-light text-balance" />
          <Reveal className="mt-6">
            <p className="max-w-[34ch]">{body}</p>
          </Reveal>
        </div>

        <div className="min-w-0 lg:col-span-6 lg:col-start-7">
          <div className="rounded-t-2xl bg-card px-6 pt-8 pb-6 sm:px-10 sm:pt-10">
            <Reveal className="flex flex-col gap-7">
              {site.process.map((step) => (
                <div key={step.title}>
                  <div className="flex items-baseline gap-3">
                    <h3 className="font-semibold">{step.title}</h3>
                    <Leader />
                    <p className="shrink-0 tabular-nums">{step.when}</p>
                  </div>
                  <p className="mt-1 max-w-[44ch] text-small text-muted-foreground">{step.description}</p>
                </div>
              ))}
              <p className="-mx-3 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 rounded-lg bg-foreground px-3 py-3 text-background sm:-mx-4 sm:px-4">
                <span className="text-small">{result.note}</span>
                <span className="font-semibold">{result.value}</span>
              </p>
            </Reveal>
          </div>
          <CutEdge kind="zigzag" side="bottom" className="text-card" />
        </div>
      </div>
    </section>
  )
}
