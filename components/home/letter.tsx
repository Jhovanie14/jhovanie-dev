import Image from "next/image"

import { CopyEmail } from "@/components/copy-email"
import { Reveal } from "@/components/motion/reveal"
import { RiseText } from "@/components/motion/rise-text"
import { CutEdge, Perforation } from "@/components/stationery"
import { site } from "@/content/site"

/**
 * A short letter in the first person on a sheet with a scalloped edge, and a
 * tear-off strip carrying the email address. The portrait stands beside it
 * as a plate, so the sheet never sits alone on one side of the page.
 */
export function Letter() {
  const { title, paragraphs } = site.home.letter

  return (
    <section aria-labelledby="letter-title" className="frame pt-32 lg:pt-48">
      <div className="grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-6">
        <Reveal className="lg:col-span-5" each={0}>
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted">
            <Image
              src={site.avatar.src}
              alt={site.avatar.alt}
              fill
              sizes="(min-width: 1024px) 36vw, 100vw"
              className="object-cover object-[50%_30%]"
            />
          </div>
        </Reveal>

        <div className="lg:col-span-6 lg:col-start-7">
          <div className="rounded-t-2xl bg-card px-6 pt-10 pb-10 sm:px-12 sm:pt-14">
            <RiseText id="letter-title" text={title} className="text-heading font-light" />
            <Reveal className="mt-8 flex max-w-[52ch] flex-col gap-5">
              {paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              <p className="mt-4">
                <span className="block text-lead font-semibold">{site.name}</span>
                <span className="text-small text-muted-foreground">{site.role}</span>
              </p>
            </Reveal>
          </div>

          {/* The tear-off strip. */}
          <div className="bg-card px-6 sm:px-12">
            <Perforation orientation="horizontal" />
          </div>
          <div className="flex items-center justify-between gap-4 bg-card px-6 py-6 sm:px-12">
            <a
              href={`mailto:${site.email}`}
              className="min-w-0 truncate text-lead font-semibold underline decoration-transparent underline-offset-[0.2em] transition-[text-decoration-color] duration-200 hover:decoration-current"
            >
              {site.email}
            </a>
            <CopyEmail />
          </div>
          <CutEdge kind="scallop" side="bottom" className="text-card" />
        </div>
      </div>
    </section>
  )
}
