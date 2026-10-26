import { Reveal } from "@/components/motion/reveal"
import { RiseText } from "@/components/motion/rise-text"
import { site } from "@/content/site"

import { BuildReceipt } from "./build-receipt"

const toolCount = site.skills.reduce((n, group) => n + group.items.length, 0)

/**
 * What the line covers, set like a printed programme: the claim, a short
 * note, then the facts in large type. Every fact is derived from site.ts.
 */
export function IntroFacts() {
  const { title, body, years, stack } = site.home.intro

  const facts = [
    { value: `${site.yearsOfExperience} years`, note: years },
    stack,
    {
      value: `${toolCount} tools`,
      note: `across ${site.skills.map((g) => g.group).join(", ")}`,
    },
  ]

  return (
    <section aria-labelledby="intro-heading" className="frame pt-32 lg:pt-48">
      <div className="grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-6">
        <div className="lg:col-span-7">
          <RiseText id="intro-heading" text={title} className="text-heading font-light text-balance" />
        </div>
        <Reveal className="lg:col-span-4 lg:col-start-9">
          <p className="max-w-[40ch]">{body}</p>
        </Reveal>
      </div>

      <div className="mt-16 grid gap-14 lg:mt-24 lg:grid-cols-12 lg:gap-6">
        <Reveal className="flex flex-col gap-10 lg:col-span-5">
          {facts.map(({ value, note }) => (
            <div key={value}>
              <p className="text-lead font-semibold">{value}</p>
              <p className="mt-1 text-small text-muted-foreground">{note}</p>
            </div>
          ))}
        </Reveal>
        <Reveal className="lg:col-span-6 lg:col-start-7" each={0}>
          <BuildReceipt />
        </Reveal>
      </div>
    </section>
  )
}
