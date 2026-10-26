import Image from "next/image"
import Link from "next/link"

import { BookCall } from "@/components/layout/book-call"
import { RiseText } from "@/components/motion/rise-text"
import { Notches, Perforation } from "@/components/stationery"
import { site } from "@/content/site"
import { navTransition } from "@/lib/navigation"

import { HeroMotion } from "./hero-motion"
import { LocalTime } from "./local-time"

/**
 * The first screen is a ticket for the line (DESIGN.md §6): the name and
 * what I do on the body, the illustration on the stub, the trip's details
 * set in ticket columns along the bottom.
 */
export function HeroTicket() {
  const { heroImage, ticket, secondaryCta } = site.home

  const details = [
    { term: ticket.status, detail: site.availability.label, live: site.availability.open },
    { term: ticket.time, detail: <LocalTime timeZone={site.timezone} /> },
    { term: ticket.basedIn, detail: site.location },
  ]

  return (
    <section aria-labelledby="intro-title" className="frame pt-4 lg:pt-3">
      <HeroMotion className="paper relative grid overflow-hidden rounded-2xl lg:min-h-[calc(100svh-1.5rem)] lg:grid-cols-[minmax(0,1.2fr)_auto_minmax(0,1fr)]">
        <div className="@container flex flex-col p-6 sm:p-10 lg:p-14">
          <RiseText
            as="h1"
            id="intro-title"
            text={site.name}
            by="chars"
            onLoad
            // Sized to its column (cqw) so the longest word always fits beside the sidebar.
            className="pb-[0.06em] text-[min(var(--text-display),22cqw)] leading-[0.9] font-bold tracking-[-0.045em]"
          />
          <p data-load className="mt-8 max-w-[30ch] text-lead text-balance">
            {site.role}. {site.bio.short}
          </p>

          <div data-load className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
            <BookCall className="h-12 px-6 text-body" />
            <Link
              href="/projects"
              transitionTypes={navTransition("/", "/projects")}
              className="press group inline-flex h-12 items-center gap-2 rounded-full font-semibold"
            >
              {secondaryCta}
              <span aria-hidden className="transition-transform duration-300 ease-glide group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>

          {/* Ticket columns: the trip's details, small and exact. */}
          <dl className="mt-14 grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-3 lg:mt-auto lg:pt-16">
            {details.map(({ term, detail, live }) => (
              <div key={term}>
                <dt className="text-small text-(--paper-muted)">{term}</dt>
                <dd className="mt-1 flex items-baseline gap-2 font-semibold">
                  {live && <span aria-hidden className="size-2 shrink-0 rounded-full bg-line-2" />}
                  <span>{detail}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* The tear line between the ticket and its stub. */}
        <div className="relative -order-1 flex items-center px-4 py-3 lg:order-none lg:flex-col lg:px-3 lg:py-6">
          <Perforation orientation="horizontal" className="lg:hidden" />
          <Perforation orientation="vertical" className="hidden lg:block" />
          <span className="lg:hidden">
            <Notches orientation="horizontal" at="50%" />
          </span>
          <span className="hidden lg:block">
            <Notches orientation="vertical" at="50%" />
          </span>
        </div>

        <div data-load-open className="relative -order-2 aspect-[4/3] overflow-hidden bg-muted lg:order-none lg:aspect-auto">
          <div data-drift className="absolute inset-x-0 -top-[4%] -bottom-[4%]">
            <Image
              data-load-picture
              src={heroImage.src}
              alt={heroImage.alt}
              fill
              priority
              sizes="(min-width: 1024px) 42vw, 100vw"
              className="object-cover object-[60%_40%]"
            />
          </div>
        </div>
      </HeroMotion>
    </section>
  )
}
