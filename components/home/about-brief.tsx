import Image from "next/image"
import Link from "next/link"

import { Reveal } from "@/components/motion/reveal"
import { site } from "@/content/site"
import { navTransition } from "@/lib/navigation"

/** Who builds it: the portrait on a plate, the facts, the story in my words. */
export function AboutBrief() {
  const { facts } = site.about
  const items = [
    { label: facts.based, value: site.location },
    { label: facts.experience, value: `${site.yearsOfExperience} years` },
    { label: facts.status, value: site.availability.label },
  ]

  return (
    <section aria-labelledby="about-title" className="frame pt-32 lg:pt-44">
      <Reveal className="grid gap-10 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-16">
        <div className="relative aspect-square w-full max-w-xs overflow-hidden bg-plate-3">
          <Image src={site.avatar.src} alt={site.avatar.alt} fill sizes="20rem" className="object-cover" />
        </div>
        <div>
          <h2 id="about-title" className="text-heading font-semibold">
            Who builds it
          </h2>
          <p className="mt-5 max-w-[60ch] text-lead">{site.bio.long}</p>
          <dl className="mt-8 grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-3">
            {items.map(({ label, value }) => (
              <div key={label} className="bg-card px-4 py-3">
                <dt className="text-small text-muted-foreground">{label}</dt>
                <dd className="font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
          <Link href="/about" transitionTypes={navTransition("/", "/about")} className="link mt-6 inline-block font-semibold">
            {site.home.about.more} →
          </Link>
        </div>
      </Reveal>
    </section>
  )
}
