import type { Metadata } from "next"
import Image from "next/image"

import { Contact } from "@/components/home/contact"
import { PageTransition } from "@/components/layout/page-transition"
import { Reveal } from "@/components/motion/reveal"
import { RiseText } from "@/components/motion/rise-text"
import { site, type Experience } from "@/content/site"
import { isLinkAvailable } from "@/lib/assets"

const { title, facts, record, process, cv, present } = site.about

export const metadata: Metadata = { title, description: site.bio.short }

const year = (value: string) => value.slice(0, 4)
const span = ({ start, end }: Experience) => `${year(start)}–${end === "present" ? present : year(end)}`

export default function AboutPage() {
  const cvAvailable = site.cvUrl && isLinkAvailable(site.cvUrl)
  const sideFacts = [
    { label: facts.based, value: site.location },
    { label: facts.experience, value: `${site.yearsOfExperience} years` },
    { label: facts.status, value: site.availability.label },
  ]

  return (
    <PageTransition>
      <header className="frame pt-[12svh] lg:pt-[16svh]">
        <div className="lg:pl-[16%]">
          <RiseText as="h1" text={title} by="chars" onLoad className="display" />
          <p className="column mt-6 text-lead">
            {site.role}. {site.bio.short}
          </p>
        </div>
      </header>

      {/* Side facts, wide paragraph, the illustration beside it. */}
      <section aria-label={title} className="frame pt-24 lg:pt-32">
        <Reveal className="grid gap-10 lg:grid-cols-[16%_minmax(0,40rem)_minmax(0,1fr)] lg:gap-0">
          <dl className="grid grid-cols-3 gap-4 text-small lg:flex lg:flex-col lg:gap-5 lg:pr-6">
            {sideFacts.map(({ label, value }) => (
              <div key={label}>
                <dt className="text-muted-foreground">{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <div>
            <p className="text-lead">{site.bio.long}</p>
            {cvAvailable && (
              <a href={site.cvUrl} className="link mt-6 inline-block font-medium">
                {cv} ↓
              </a>
            )}
          </div>
          <div className="relative aspect-[4/5] w-full max-w-sm overflow-hidden rounded-lg bg-surface lg:ml-12">
            <Image
              src={site.illustration.src}
              alt={site.illustration.alt}
              fill
              priority
              sizes="(min-width: 1024px) 24rem, 100vw"
              className="object-cover object-[60%_40%]"
            />
          </div>
        </Reveal>
      </section>

      {/* The record: roles on the left list, stack by layer on the right. */}
      <section aria-labelledby="record-title" className="frame pt-32 lg:pt-44">
        <div className="lg:pl-[16%]">
          <RiseText id="record-title" text={record.roles} className="text-heading font-medium" />
          <Reveal className="column mt-8 flex flex-col gap-8">
            {site.experience.map((role) => (
              <article key={`${role.company}-${role.start}`}>
                <div className="flex items-baseline justify-between gap-6">
                  <h3 className="font-medium">{role.title}</h3>
                  <p className="text-small text-muted-foreground tabular-nums">{span(role)}</p>
                </div>
                <p className="text-muted-foreground">{role.company}</p>
                <ul className="mt-2 flex flex-col gap-1">
                  {role.highlights.map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
              </article>
            ))}
          </Reveal>
        </div>
      </section>

      <section aria-labelledby="stack-title" className="frame pt-32 lg:pt-44">
        <div className="lg:pl-[16%]">
          <RiseText id="stack-title" text={record.stack} className="text-heading font-medium" />
          <Reveal className="column mt-8 flex flex-col gap-5">
            {site.skills.map(({ group, items, note }) => (
              <div key={group} className="grid gap-1 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-6">
                <h3 className="text-muted-foreground">{group}</h3>
                <div>
                  <p className="font-medium">{items.join(", ")}</p>
                  {note && <p className="text-small text-muted-foreground">{note}</p>}
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section aria-labelledby="process-title" className="frame pt-32 lg:pt-44">
        <div className="lg:pl-[16%]">
          <RiseText id="process-title" text={process} className="text-heading font-medium" />
          <Reveal className="column mt-8">
            <ol className="flex flex-col gap-5">
              {site.process.map((step) => (
                <li key={step.title} className="grid gap-1 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-6">
                  <div>
                    <h3 className="font-medium">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                  <p className="text-small text-muted-foreground sm:pt-1">{step.when}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      <Contact />
    </PageTransition>
  )
}
