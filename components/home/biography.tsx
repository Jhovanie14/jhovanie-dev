import { SectionLabel } from "@/components/section-header"
import { site } from "@/content/site"

const toolCount = site.skills.reduce((n, group) => n + group.items.length, 0)

// Only numbers derived from site.ts: nothing here is invented.
const stats = [
  { value: site.yearsOfExperience, suffix: "+", label: site.home.biography.stats.years },
  { value: site.projects.length, suffix: "", label: site.home.biography.stats.projects },
  { value: toolCount, suffix: "", label: site.home.biography.stats.tools },
].filter((stat) => stat.value > 0)

export function Biography() {
  const { label, title } = site.home.biography

  return (
    <section aria-labelledby="bio-title" className="mt-28">
      <h2 id="bio-title" className="sr-only">
        {title}
      </h2>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)] lg:gap-10">
        <SectionLabel>{label}</SectionLabel>
        <p className="text-2xl leading-snug font-medium tracking-[-0.02em] text-balance sm:text-[1.75rem] lg:text-[2rem]">
          {site.bio.long}
        </p>
      </div>

      {stats.length > 0 && (
        <dl className="mt-14 grid grid-cols-3 gap-3 sm:gap-4">
          {stats.map(({ value, suffix, label }) => (
            <div key={label} className="edge-light flex flex-col-reverse rounded-2xl border bg-card p-4 sm:p-6">
              <dt className="mt-2 text-xs text-muted-foreground sm:mt-3 sm:text-sm">{label}</dt>
              <dd className="text-4xl font-medium tracking-[-0.04em] tabular-nums sm:text-5xl">
                {value}
                {suffix && <sup className="ml-0.5 text-2xl text-line-1">{suffix}</sup>}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  )
}
