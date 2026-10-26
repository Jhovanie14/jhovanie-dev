import Link from "next/link"

import { BookCall } from "@/components/layout/book-call"
import { LoadIn } from "@/components/motion/load-in"
import { RiseText } from "@/components/motion/rise-text"
import { Trace } from "@/components/trace/trace"
import { site } from "@/content/site"
import { navTransition } from "@/lib/navigation"

/**
 * The quiet instrument's first screen: one edge, the name at display size,
 * one sentence, one action, and the live demonstration right under it.
 */
export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="frame pt-[14svh] lg:pt-[20svh]">
      <LoadIn className="lg:pl-[16%]">
        <RiseText as="h1" id="hero-title" text={site.name} by="chars" onLoad className="display text-balance" />
        <p data-load className="mt-6 max-w-[36ch] text-lead">
          {site.role}. {site.bio.short}
        </p>
        <div data-load className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <BookCall />
          <Link href="/projects" transitionTypes={navTransition("/", "/projects")} className="link font-medium">
            {site.cta.work} →
          </Link>
        </div>

        <div data-load className="column mt-14 lg:mt-20">
          <Trace />
          <p className="mt-3 text-small text-muted-foreground">{site.trace.hint}</p>
        </div>
      </LoadIn>
    </section>
  )
}
