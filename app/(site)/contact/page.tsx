import type { Metadata } from "next"

import { Contact } from "@/components/home/contact"
import { PageTransition } from "@/components/layout/page-transition"
import { LocalTime } from "@/components/local-time"
import { Reveal } from "@/components/motion/reveal"
import { site } from "@/content/site"

export const metadata: Metadata = { title: "Contact", description: site.contact.next }

/** Contact: the invitation as the page, then the other ways to reach me as two-ended rows. */
export default function ContactPage() {
  const rows = [
    ...site.socials.map(({ label, href }) => ({ label, value: href.replace(/^https?:\/\/(www\.)?/, ""), href })),
    { label: site.about.facts.based, value: site.location, href: undefined },
  ]

  return (
    <PageTransition>
      <Contact as="h1" />

      <section aria-label="Elsewhere" className="frame pt-20">
        <Reveal className="column flex flex-col lg:ml-[16%]">
          {rows.map(({ label, value, href }) => (
            <div key={label} className="flex items-baseline justify-between gap-6 py-2.5">
              <p className="font-medium">
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
          <div className="flex items-baseline justify-between gap-6 py-2.5">
            <p className="font-medium">Local time</p>
            <p className="text-small text-muted-foreground">
              <LocalTime timeZone={site.timezone} />
            </p>
          </div>
        </Reveal>
      </section>
    </PageTransition>
  )
}
