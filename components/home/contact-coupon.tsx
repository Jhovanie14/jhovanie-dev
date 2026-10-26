import Image from "next/image"

import { BookCall } from "@/components/layout/book-call"
import { Reveal } from "@/components/motion/reveal"
import { Notches, Perforation } from "@/components/stationery"
import { SmartLink } from "@/components/smart-link"
import { site } from "@/content/site"

/**
 * The booking, as a coupon to tear off: one field of signal orange held up
 * against a platform photograph, the pitch on one side of the perforation
 * and the ways to reach me on the other.
 */
export function ContactCoupon({ from = "/" }: { from?: string }) {
  const { title, body, image, recruiters } = site.home.contact

  return (
    <section aria-labelledby="contact-title" className="relative mt-32 overflow-clip lg:mt-48">
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes="100vw"
        className="object-cover object-[50%_45%]"
      />
      {/* A flat scrim so the photograph sits back behind the coupon. */}
      <div aria-hidden className="absolute inset-0 bg-background/45" />

      <div className="frame relative py-24 lg:py-40">
        <Reveal each={0} distance={32}>
          <div className="relative mx-auto grid max-w-5xl overflow-hidden rounded-2xl bg-primary text-primary-foreground lg:grid-cols-[minmax(0,1.1fr)_auto_minmax(0,1fr)]">
            <div className="flex flex-col justify-between gap-6 p-8 sm:p-12">
              <h2 id="contact-title" className="text-heading font-bold text-balance">
                {title}
              </h2>
              <p className="max-w-[34ch]">{body}</p>
            </div>

            <div className="relative flex items-center px-6 lg:flex-col lg:px-0 lg:py-6">
              <Perforation orientation="horizontal" className="lg:hidden" />
              <Perforation orientation="vertical" className="hidden lg:block" />
              <span className="lg:hidden">
                <Notches orientation="horizontal" at="50%" />
              </span>
              <span className="hidden lg:block">
                <Notches orientation="vertical" at="50%" />
              </span>
            </div>

            <div className="flex flex-col justify-center gap-4 p-8 sm:p-12">
              <BookCall className="h-14 bg-primary-foreground text-body text-primary hover:bg-primary-foreground/90" />
              <a
                href={`mailto:${site.email}`}
                className="truncate text-center font-semibold underline decoration-transparent underline-offset-[0.2em] transition-[text-decoration-color] duration-200 hover:decoration-current"
              >
                {site.email}
              </a>
              <SmartLink
                href={recruiters.href}
                from={from}
                className="text-center text-small underline underline-offset-[0.2em]"
              >
                {recruiters.label}
              </SmartLink>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
