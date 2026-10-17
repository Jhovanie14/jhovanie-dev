import { SectionHeader } from "@/components/section-header"
import { site, type Experience } from "@/content/site"
import { cn } from "@/lib/utils"

const monthYear = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" })

function formatMonth(value: string) {
  return monthYear.format(new Date(`${value}-01T00:00:00Z`))
}

function range({ start, end }: Experience) {
  return `${formatMonth(start)} – ${end === "present" ? site.home.experience.present : formatMonth(end)}`
}

/** Roles as cards on a shared track: the current role is lit, past roles sit back. */
export function ExperienceTimeline() {
  const { label, title } = site.home.experience
  const roles = site.experience

  if (roles.length === 0) return null

  return (
    <section aria-labelledby="experience-title" className="mt-28">
      <SectionHeader id="experience-title" label={label} title={title} />

      <ol
        className="mt-12 grid gap-4 md:grid-cols-(--cols)"
        style={{ "--cols": `repeat(${Math.min(roles.length, 3)}, minmax(0, 1fr))` } as React.CSSProperties}
      >
        {roles.map((role) => {
          const current = role.end === "present"

          return (
            <li
              key={`${role.company}-${role.start}`}
              className={cn(
                "edge-light group rounded-2xl border bg-card p-6 text-center transition-opacity duration-300",
                !current && "opacity-70 hover:opacity-100"
              )}
            >
              <p className="font-mono text-xs text-muted-foreground tabular-nums">{range(role)}</p>

              {/* The track: solid and lit for the current role, dotted for the past. */}
              <div aria-hidden className="relative -mx-6 my-5 flex items-center">
                <span
                  className={cn(
                    "h-0 flex-1 border-t-2",
                    current ? "border-solid border-line-1" : "border-dotted border-muted-foreground/40"
                  )}
                />
                <span
                  className={cn(
                    "absolute left-1/2 size-3 -translate-x-1/2 rounded-full border-2",
                    current ? "border-line-1 bg-line-1" : "border-muted-foreground/60 bg-card"
                  )}
                />
              </div>

              <h3 className="text-xl font-medium tracking-[-0.02em]">{role.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{role.company}</p>
              {role.highlights[0] && (
                <p className="mx-auto mt-4 max-w-[36ch] text-sm leading-relaxed text-muted-foreground">
                  {role.highlights[0]}
                </p>
              )}
            </li>
          )
        })}
      </ol>
    </section>
  )
}
