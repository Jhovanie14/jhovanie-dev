import { CopyEmail } from "@/components/copy-email"
import { CtaPill } from "@/components/cta-pill"
import { SectionLabel } from "@/components/section-header"
import { SmartLink } from "@/components/smart-link"
import { site } from "@/content/site"

import { LocalTime } from "./local-time"

/** Closing CTA: the pitch on the left, the ways to reach me on the right. */
export function ContactBand() {
  const { label, title, body, recruiters } = site.home.contact

  return (
    <section aria-labelledby="contact-title" className="mt-28 grid gap-10 lg:grid-cols-2 lg:gap-16">
      <div>
        <SectionLabel>{label}</SectionLabel>
        <h2
          id="contact-title"
          className="mt-6 max-w-[16ch] text-4xl leading-[1.05] font-medium tracking-[-0.035em] text-balance sm:text-5xl"
        >
          {title}
        </h2>
        <p className="mt-5 max-w-[44ch] text-lg leading-relaxed text-muted-foreground">{body}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <CtaPill href={site.bookingUrl}>{site.cta.book}</CtaPill>
          <CtaPill href="/contact" from="/" variant="outline">
            {site.cta.contact}
          </CtaPill>
        </div>
      </div>

      <div className="edge-light self-start rounded-2xl border bg-card p-6 sm:p-8">
        <dl className="divide-y divide-dashed">
          <div className="flex items-center justify-between gap-4 pb-5">
            <div className="min-w-0">
              <dt className="text-sm text-muted-foreground">{site.ui.email}</dt>
              <dd className="mt-1 truncate text-xl font-medium tracking-[-0.02em]">
                <a href={`mailto:${site.email}`} className="hover:underline">
                  {site.email}
                </a>
              </dd>
            </div>
            <CopyEmail />
          </div>
          <div className="flex items-end justify-between gap-4 py-5">
            <div>
              <dt className="text-sm text-muted-foreground">{site.ui.basedIn}</dt>
              <dd className="mt-1 text-xl font-medium tracking-[-0.02em]">{site.location}</dd>
            </div>
            <dd className="text-sm text-muted-foreground">
              <LocalTime timeZone={site.timezone} label={site.home.localTimeLabel} />
            </dd>
          </div>
        </dl>
        <SmartLink
          href={recruiters.href}
          from="/"
          className="mt-1 inline-flex text-sm font-medium underline decoration-border underline-offset-4 hover:decoration-foreground"
        >
          {recruiters.label}
        </SmartLink>
      </div>
    </section>
  )
}
