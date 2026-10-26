import type { Metadata } from "next"
import Image from "next/image"

import { Assembly, type Part } from "@/components/assembly/assembly"
import { Contact } from "@/components/home/contact"
import { PageTransition } from "@/components/layout/page-transition"
import { Reveal } from "@/components/motion/reveal"
import { RiseText } from "@/components/motion/rise-text"
import { site } from "@/content/site"
import { isLinkAvailable } from "@/lib/assets"

const { title, facts, record, cv, present } = site.about

export const metadata: Metadata = { title, description: site.bio.short }

const year = (v: string) => v.slice(0, 4)

// The career as an assembly: the first role at the base, the current one on top.
const career: Part[] = [...site.experience]
  .sort((a, b) => a.start.localeCompare(b.start))
  .map((e) => ({
    id: `${e.title}-${e.start}`,
    title: e.title,
    caption: `${year(e.start)}–${e.end === "present" ? present : year(e.end)}`,
    detail: `${e.company}. ${e.highlights.join(" ")} Stack: ${e.stack.join(", ")}.`,
  }))

export default function AboutPage() {
  const cvAvailable = site.cvUrl && isLinkAvailable(site.cvUrl)
  const sideFacts = [
    { label: facts.based, value: site.location },
    { label: facts.experience, value: `${site.yearsOfExperience} years` },
    { label: facts.status, value: site.availability.label },
  ]

  return (
    <PageTransition>
      <header className="frame grid gap-10 pt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-end lg:gap-16 lg:pt-24">
        <div>
          <RiseText as="h1" text={title} by="chars" onLoad className="display" />
          <p className="mt-5 max-w-[60ch] text-lead">{site.bio.long}</p>
          <dl className="mt-8 grid max-w-2xl gap-4 sm:grid-cols-3">
            {sideFacts.map(({ label, value }) => (
              <div key={label} className="bg-card px-4 py-3">
                <dt className="text-small text-muted-foreground">{label}</dt>
                <dd className="font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
          {cvAvailable && (
            <a href={site.cvUrl} className="link mt-6 inline-block font-semibold">
              {cv} ↓
            </a>
          )}
        </div>
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-plate-3">
          <Image src={site.illustration.src} alt={site.illustration.alt} fill priority sizes="(min-width: 1024px) 24rem, 100vw" className="object-cover object-[60%_40%]" />
        </div>
      </header>

      <div className="frame pt-32 lg:pt-44">
        <Assembly parts={career} label={site.assembly.career} details="always">
          <h2 className="text-heading font-semibold">{record.roles}</h2>
          <p className="mt-3 max-w-[40ch] text-muted-foreground">Each plate is a role, the first one at the base.</p>
        </Assembly>
      </div>

      <section aria-labelledby="stack-title" className="frame pt-32 lg:pt-44">
        <RiseText id="stack-title" text={record.stack} className="text-heading font-semibold" />
        <Reveal className="mt-8" each={0}>
          <table className="w-full text-left">
            <caption className="sr-only">{record.stack}</caption>
            <tbody>
              {site.skills.map((g) => (
                <tr key={g.group} className="border-b border-border align-top">
                  <th scope="row" className="w-40 py-4 pr-6 font-semibold sm:w-56">
                    {g.group}
                  </th>
                  <td className="py-4">
                    <span className="text-lead font-semibold">{g.items.join(", ")}</span>
                    {g.note && <span className="mt-1 block text-muted-foreground">{g.note}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      </section>

      <Contact />
    </PageTransition>
  )
}
