"use client"

import { useId, useState } from "react"
import Link from "next/link"
import { IconArrowUpRight } from "@tabler/icons-react"

import { SectionHeader } from "@/components/section-header"
import { site } from "@/content/site"
import { navTransition } from "@/lib/navigation"
import { cn } from "@/lib/utils"

/** Numbered service rows; one opens at a time to show its description and stack. */
export function Services() {
  const [open, setOpen] = useState(0)
  const baseId = useId()
  const { label, title } = site.home.services

  if (site.services.length === 0) return null

  return (
    <section aria-labelledby="services-title" className="mt-28">
      <SectionHeader id="services-title" label={label} title={title} />

      <ul className="mt-10 flex flex-col gap-3">
        {site.services.map((service, i) => {
          const isOpen = open === i
          const panelId = `${baseId}-panel-${i}`

          return (
            <li
              key={service.title}
              className={cn(
                "edge-light rounded-2xl border bg-card transition-colors duration-300",
                isOpen && "border-line-1/30"
              )}
            >
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="group flex w-full items-center gap-5 rounded-2xl p-5 text-left sm:gap-10 sm:px-8 sm:py-6"
              >
                <span className="w-12 shrink-0 font-mono text-sm text-muted-foreground tabular-nums">
                  [{String(i + 1).padStart(3, "0")}]
                </span>
                <span className="flex-1 text-xl font-medium tracking-[-0.02em] sm:text-2xl">
                  {service.title}
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "grid size-10 shrink-0 place-items-center rounded-full border transition-all duration-300 ease-glide",
                    isOpen
                      ? "rotate-45 border-transparent bg-primary text-primary-foreground"
                      : "text-muted-foreground group-hover:border-line-1/60 group-hover:text-foreground"
                  )}
                >
                  <IconArrowUpRight stroke={2} className="size-[1.125rem]" />
                </span>
              </button>

              {/* grid-rows 0fr → 1fr animates to the content's natural height. */}
              <div
                id={panelId}
                role="region"
                aria-label={service.title}
                className={cn(
                  "grid transition-[grid-template-rows] duration-500 ease-glide motion-reduce:transition-none",
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                )}
              >
                <div className="overflow-hidden" inert={!isOpen}>
                  <div className="flex flex-col gap-5 px-5 pb-6 sm:flex-row sm:items-end sm:justify-between sm:pr-8 sm:pl-[6.5rem]">
                    <div>
                      <p className="max-w-[52ch] leading-relaxed text-muted-foreground">
                        {service.description}
                      </p>
                      {service.stack.length > 0 && (
                        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label={site.ui.stack}>
                          {service.stack.map((tech) => (
                            <li key={tech} className="rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground">
                              {tech}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <Link
                      href="/contact"
                      transitionTypes={navTransition("/", "/contact")}
                      className="shrink-0 text-sm font-medium underline decoration-border underline-offset-4 hover:decoration-foreground"
                    >
                      {site.cta.contact}
                    </Link>
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
