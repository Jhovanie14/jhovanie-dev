import type { Metadata } from "next"
import Image from "next/image"

import { ContactCoupon } from "@/components/home/contact-coupon"
import { PageTransition } from "@/components/layout/page-transition"
import { Reveal } from "@/components/motion/reveal"
import { RiseText } from "@/components/motion/rise-text"
import { site, type Experience } from "@/content/site"
import { isLinkAvailable } from "@/lib/assets"
import { cn } from "@/lib/utils"

const { title, intro, experienceTitle, skillsTitle, cv, present } = site.about

export const metadata: Metadata = { title, description: intro }

const monthYear = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" })

function formatMonth(value: string) {
  return monthYear.format(new Date(`${value}-01T00:00:00Z`))
}

function range({ start, end }: Experience) {
  return `${formatMonth(start)} to ${end === "present" ? present : formatMonth(end)}`
}

export default function AboutPage() {
  const cvAvailable = site.cvUrl && isLinkAvailable(site.cvUrl)

  return (
    <PageTransition>
      <header className="frame grid gap-12 pt-10 lg:grid-cols-12 lg:gap-6 lg:pt-16">
        <div className="flex flex-col lg:col-span-7">
          <RiseText as="h1" text={title} by="chars" onLoad className="display max-w-[6em] pb-[0.06em]" />
          <p className="mt-8 max-w-[30ch] text-lead text-balance">{intro}</p>
          <div className="mt-auto flex max-w-[60ch] flex-col gap-5 pt-12">
            {site.home.letter.paragraphs.slice(0, 2).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            {cvAvailable && (
              <a
                href={site.cvUrl}
                className="press inline-flex h-12 w-fit items-center rounded-full bg-muted px-6 font-semibold hover:bg-accent"
              >
                {cv}
              </a>
            )}
          </div>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted lg:col-span-5">
          <Image
            src={site.home.heroImage.src}
            alt={site.home.heroImage.alt}
            fill
            priority
            sizes="(min-width: 1024px) 38vw, 100vw"
            className="object-cover object-[62%_40%]"
          />
        </div>
      </header>

      {site.experience.length > 0 && (
        <section aria-labelledby="experience-title" className="frame pt-32 lg:pt-48">
          <RiseText id="experience-title" text={experienceTitle} className="text-heading font-light" />

          {/* The earlier stations: the current role is lit, past ones are hollow. */}
          <Reveal className="mt-14 flex flex-col gap-12 lg:mt-20">
            {site.experience.map((role) => {
              const current = role.end === "present"

              return (
                <article key={`${role.company}-${role.start}`} className="grid gap-4 lg:grid-cols-12 lg:gap-6">
                  <p className="flex items-center gap-3 text-small text-muted-foreground tabular-nums lg:col-span-3 lg:pt-2">
                    <span
                      aria-hidden
                      className={cn("size-3 shrink-0 rounded-full border-2 border-line-1", current && "bg-line-1")}
                    />
                    {range(role)}
                  </p>
                  <div className="lg:col-span-6">
                    <h3 className="text-lead font-semibold">{role.title}</h3>
                    <p className="mt-1 text-muted-foreground">{role.company}</p>
                    <ul className="mt-4 flex flex-col gap-2">
                      {role.highlights.map((highlight) => (
                        <li key={highlight}>{highlight}</li>
                      ))}
                    </ul>
                  </div>
                  {role.stack.length > 0 && (
                    <p className="text-small text-muted-foreground lg:col-span-3 lg:pt-2 lg:text-right">
                      {role.stack.join(" · ")}
                    </p>
                  )}
                </article>
              )
            })}
          </Reveal>
        </section>
      )}

      <section aria-labelledby="skills-title" className="frame grid gap-12 pt-32 lg:grid-cols-12 lg:gap-6 lg:pt-48">
        <div className="lg:col-span-5">
          <RiseText id="skills-title" text={skillsTitle} className="text-heading font-light text-balance" />
          <div className="relative mt-10 aspect-square max-w-xs overflow-hidden rounded-2xl bg-muted">
            <Image
              src={site.avatar.src}
              alt={site.avatar.alt}
              fill
              sizes="(min-width: 1024px) 24rem, 100vw"
              className="object-cover object-[50%_30%]"
            />
          </div>
        </div>
        <Reveal className="flex flex-col gap-8 lg:col-span-6 lg:col-start-7">
          {site.skills.map(({ group, items }) => (
            <div key={group} className="grid gap-1 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-6">
              <h3 className="text-muted-foreground">{group}</h3>
              <p className="text-lead font-semibold">{items.join(", ")}</p>
            </div>
          ))}
        </Reveal>
      </section>

      <ContactCoupon from="/about" />
    </PageTransition>
  )
}
