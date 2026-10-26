import Image from "next/image"
import Link from "next/link"

import { Reveal } from "@/components/motion/reveal"
import { site } from "@/content/site"
import { navTransition } from "@/lib/navigation"

/**
 * Side facts and a wide paragraph: who, where and since when on the left,
 * the story in my words across the rest, the portrait held to a small plate.
 */
export function AboutBrief() {
  const { facts } = site.about
  const items = [
    { label: facts.based, value: site.location },
    { label: facts.experience, value: `${site.yearsOfExperience} years` },
    { label: facts.status, value: site.availability.label },
  ]

  return (
    <section aria-labelledby="about-title" className="frame pt-32 lg:pt-44">
      <h2 id="about-title" className="sr-only">
        {site.about.title}
      </h2>
      <Reveal className="grid gap-10 lg:grid-cols-[16%_minmax(0,1fr)] lg:gap-0">
        <dl className="grid grid-cols-3 gap-4 text-small lg:flex lg:flex-col lg:gap-5 lg:pr-6">
          {items.map(({ label, value }) => (
            <div key={label}>
              <dt className="text-muted-foreground">{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_12rem] md:gap-12 lg:max-w-[60rem]">
          <div>
            <p className="text-lead">{site.bio.long}</p>
            <Link href="/about" transitionTypes={navTransition("/", "/about")} className="link mt-6 inline-block font-medium">
              {site.home.about.more} →
            </Link>
          </div>
          <div className="relative aspect-square w-40 overflow-hidden rounded-lg bg-surface md:w-full">
            <Image src={site.avatar.src} alt={site.avatar.alt} fill sizes="12rem" className="object-cover" />
          </div>
        </div>
      </Reveal>
    </section>
  )
}
