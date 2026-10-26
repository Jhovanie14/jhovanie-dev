"use client"

import { useRef } from "react"

import { RiseText } from "@/components/motion/rise-text"
import { site } from "@/content/site"
import { ease, fullMotion, gsap, stagger, useGSAP } from "@/lib/motion"

/**
 * What I build, as a poster: one service per line at display size, each a
 * station on the route. The line draws itself from station to station as the
 * section passes, locked to the scrollbar, and each station fills as the
 * line reaches it. Static (line drawn, stations hollow) without motion.
 */
export function ServicesLine() {
  const { title, body } = site.home.services
  const scope = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(fullMotion, () => {
        gsap.fromTo(
          "[data-segment]",
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            stagger: 1,
            scrollTrigger: { trigger: "[data-stops]", start: "top 65%", end: "bottom 65%", scrub: true },
          }
        )
        gsap.utils.toArray<HTMLElement>("[data-stop]").forEach((stop) => {
          gsap.fromTo(
            stop.querySelectorAll("[data-stop-part]"),
            { opacity: 0, y: 24 },
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: ease.expo,
              stagger: stagger.item,
              scrollTrigger: { trigger: stop, start: "top 88%", once: true },
            }
          )
          gsap.fromTo(
            stop.querySelector("[data-disc]"),
            { backgroundColor: "var(--background)" },
            {
              backgroundColor: "var(--line-1)",
              duration: 0.24,
              ease: "none",
              scrollTrigger: { trigger: stop, start: "top 65%", toggleActions: "play none none reverse" },
            }
          )
        })
      })
      return () => mm.revert()
    },
    { scope }
  )

  if (site.services.length === 0) return null

  return (
    <section ref={scope} aria-labelledby="services-title" className="frame pt-32 lg:pt-48">
      <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <RiseText id="services-title" text={title} className="text-heading font-light" />
        </div>
        <p className="max-w-[40ch] lg:col-span-4 lg:col-start-9">{body}</p>
      </div>

      {/* --poster: the poster lines' size (the display step, capped to fit the column); stations sit on each line's middle. */}
      <ol
        data-stops
        className="@container mt-16 flex flex-col gap-(--gap) [--gap:3rem] [--poster:min(var(--text-display),14cqw)] lg:mt-20 lg:[--gap:1.75rem] lg:[--poster:min(var(--text-display),9cqw)]"
      >
        {site.services.map((service, i) => {
          const last = i === site.services.length - 1

          return (
            <li
              key={service.title}
              data-stop
              className="relative grid gap-3 pl-12 sm:pl-16 lg:grid-cols-12 lg:items-baseline lg:gap-6"
            >
              {/* The route to the next station: a faint track and the drawn line over it. */}
              {!last && (
                <>
                  <span aria-hidden className="absolute top-[calc(var(--poster)*0.45)] left-[9px] h-[calc(100%+var(--gap))] w-1 rounded-full bg-line-1/25 sm:left-[11px]" />
                  <span
                    aria-hidden
                    data-segment
                    className="absolute top-[calc(var(--poster)*0.45)] left-[9px] h-[calc(100%+var(--gap))] w-1 origin-top rounded-full bg-line-1 sm:left-[11px]"
                  />
                </>
              )}
              <span
                aria-hidden
                data-disc
                className="absolute top-[calc(var(--poster)*0.45)] left-0 z-10 size-[22px] -translate-y-1/2 rounded-full border-4 border-line-1 bg-background sm:size-[26px]"
              />

              <h3
                data-stop-part
                className="text-(length:--poster) leading-[0.9] font-bold tracking-[-0.045em] whitespace-nowrap lg:col-span-8"
              >
                {service.short}
              </h3>
              <div data-stop-part className="lg:col-span-4">
                <p className="font-semibold">{service.title}</p>
                {service.stack.length > 0 && (
                  <p className="mt-1 text-small text-muted-foreground">{service.stack.join(" · ")}</p>
                )}
                <p className="mt-2 text-muted-foreground">{service.description}</p>
              </div>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
