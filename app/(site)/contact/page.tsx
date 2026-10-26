import type { Metadata } from "next"

import { Contact } from "@/components/home/contact"
import { PageTransition } from "@/components/layout/page-transition"
import { LocalTime } from "@/components/local-time"
import { Reveal } from "@/components/motion/reveal"
import { site } from "@/content/site"

export const metadata: Metadata = { title: "Contact", description: site.contact.next }

/** Contact: the project assembly with both ways to start it, then everywhere else to find me. */
export default function ContactPage() {
  const rows = [
    ...site.socials.map(({ label, href }) => ({ label, value: href.replace(/^https?:\/\/(www\.)?/, ""), href })),
    { label: site.about.facts.based, value: site.location, href: undefined },
  ]

  return (
    <PageTransition>
      <Contact as="h1" />

      <section aria-label="Elsewhere" className="frame pt-20">
        <Reveal className="flex max-w-2xl flex-col gap-1">
          {rows.map(({ label, value, href }) => (
            <div key={label} className="flex items-baseline justify-between gap-6 bg-card px-5 py-4">
              <p className="font-semibold">
                {href ? (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="link">
                    {label}
                  </a>
                ) : (
                  label
                )}
              </p>
              <p className="truncate text-small text-muted-foreground">{value}</p>
            </div>
          ))}
          <div className="flex items-baseline justify-between gap-6 bg-card px-5 py-4">
            <p className="font-semibold">Local time</p>
            <p className="text-small text-muted-foreground">
              <LocalTime timeZone={site.timezone} />
            </p>
          </div>
        </Reveal>
      </section>
    </PageTransition>
  )
}
