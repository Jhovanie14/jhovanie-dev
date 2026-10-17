import Image from "next/image"

import { CtaPill } from "@/components/cta-pill"
import { site } from "@/content/site"

import { LocalTime } from "./local-time"

/** The home intro: a framed card, copy beside the illustration. */
export function HeroCard() {
  const { heroImage } = site.home

  return (
    <section
      aria-labelledby="intro-title"
      className="edge-light grid overflow-hidden rounded-2xl border bg-card md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]"
    >
      <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-12">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          {site.availability.open && (
            <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-foreground">
              <span aria-hidden className="size-2 rounded-full bg-line-2" />
              {site.availability.label}
            </span>
          )}
          <LocalTime timeZone={site.timezone} label={site.home.localTimeLabel} />
        </div>

        <h1
          id="intro-title"
          className="mt-8 text-5xl leading-[0.95] font-bold tracking-[-0.04em] text-balance sm:text-6xl xl:text-7xl"
        >
          {site.name}
        </h1>
        <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
          {[site.role, site.location].map((item) => (
            <li key={item} className="inline-flex items-center gap-2">
              <span aria-hidden className="size-1.5 rounded-[1px] bg-line-1" />
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-6 max-w-[46ch] text-lg leading-relaxed">{site.bio.short}</p>

        <div className="mt-9 flex flex-wrap gap-3">
          <CtaPill href={site.bookingUrl}>{site.cta.book}</CtaPill>
          <CtaPill href="/projects" from="/" variant="outline">
            {site.home.secondaryCta}
          </CtaPill>
        </div>
      </div>

      {/* Fades into the card toward the copy: up on mobile, left on desktop. */}
      <div className="relative -order-1 aspect-[4/3] mask-b-from-70% md:order-none md:aspect-auto md:min-h-[32rem] md:mask-b-from-100% md:mask-l-from-75%">
        <Image
          src={heroImage.src}
          alt={heroImage.alt}
          fill
          priority
          sizes="(min-width: 1024px) 40vw, (min-width: 768px) 48vw, 100vw"
          className="object-cover object-[65%_35%]"
        />
      </div>
    </section>
  )
}
