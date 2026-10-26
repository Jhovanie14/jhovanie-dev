import type { Metadata } from "next"
import Image from "next/image"

import { CopyEmail } from "@/components/copy-email"
import { LocalTime } from "@/components/home/local-time"
import { BookCall } from "@/components/layout/book-call"
import { PageTransition } from "@/components/layout/page-transition"
import { Reveal } from "@/components/motion/reveal"
import { RiseText } from "@/components/motion/rise-text"
import { Notches, Perforation } from "@/components/stationery"
import { site } from "@/content/site"

const { title, intro, elsewhere } = site.contactPage

export const metadata: Metadata = { title, description: intro }

/** Contact: the ticket itself. Book a call or write, with the trip's details on the stub. */
export default function ContactPage() {
  const { ticket } = site.home
  const { image } = site.home.contact

  const details = [
    { term: ticket.status, detail: site.availability.label, live: site.availability.open },
    { term: ticket.time, detail: <LocalTime timeZone={site.timezone} /> },
    { term: ticket.basedIn, detail: site.location },
  ]

  return (
    <PageTransition>
      <header className="frame grid gap-10 pt-10 lg:grid-cols-12 lg:items-end lg:gap-6 lg:pt-16">
        <div className="lg:col-span-8">
          <RiseText as="h1" text={title} by="chars" onLoad className="display max-w-[9em] pb-[0.06em]" />
          <p className="mt-8 max-w-[36ch] text-lead text-balance">{intro}</p>
        </div>
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-muted lg:col-span-4 lg:aspect-[4/5]">
          <Image
            src={site.avatar.src}
            alt={site.avatar.alt}
            fill
            priority
            sizes="(min-width: 1024px) 30vw, 24rem"
            className="object-cover object-[50%_30%]"
          />
        </div>
      </header>

      <section aria-label={site.cta.book} className="relative mt-20 overflow-clip lg:mt-28">
        <Image src={image.src} alt={image.alt} fill sizes="100vw" className="object-cover object-[50%_45%]" />
        <div aria-hidden className="absolute inset-0 bg-background/45" />
        <Reveal each={0} distance={32} className="frame relative py-20 lg:py-32">
          <div className="paper relative grid overflow-hidden rounded-2xl lg:grid-cols-[minmax(0,1.3fr)_auto_minmax(0,1fr)]">
            <div className="flex flex-col gap-8 p-8 sm:p-12">
              <div>
                <div className="flex items-center justify-between gap-4">
                  <a
                    href={`mailto:${site.email}`}
                    className="min-w-0 text-lead font-semibold break-all sm:break-normal underline decoration-transparent underline-offset-[0.15em] transition-[text-decoration-color] duration-200 hover:decoration-current"
                  >
                    {site.email}
                  </a>
                  <CopyEmail className="bg-background/10 text-background hover:bg-background/20" />
                </div>
              </div>
              <BookCall className="h-14 w-fit px-8 text-body" />
              <div>
                <ul aria-label={elsewhere} className="flex flex-wrap gap-x-6 gap-y-2 text-lead font-semibold">
                  {site.socials.map(({ label, href }) => (
                    <li key={href}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline decoration-transparent underline-offset-[0.2em] transition-[text-decoration-color] duration-200 hover:decoration-current"
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="relative flex items-center px-6 lg:flex-col lg:px-3 lg:py-6">
              <Perforation orientation="horizontal" className="lg:hidden" />
              <Perforation orientation="vertical" className="hidden lg:block" />
              <span className="lg:hidden">
                <Notches orientation="horizontal" at="50%" />
              </span>
              <span className="hidden lg:block">
                <Notches orientation="vertical" at="50%" />
              </span>
            </div>

            <dl className="flex flex-col justify-center gap-6 p-8 sm:p-12">
              {details.map(({ term, detail, live }) => (
                <div key={term}>
                  <dt className="text-small text-(--paper-muted)">{term}</dt>
                  <dd className="mt-1 flex items-center gap-2 font-semibold">
                    {live && <span aria-hidden className="size-2.5 shrink-0 rounded-full bg-line-2" />}
                    {detail}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>
      </section>
    </PageTransition>
  )
}
