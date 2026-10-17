import { SectionHeader } from "@/components/section-header"
import { site } from "@/content/site"
import { cn } from "@/lib/utils"

// A fanned hand of cards on desktop: alternating tilt, slight overlap. Hover deals one forward.
const tilts = ["lg:-rotate-6", "lg:-rotate-3", "lg:-rotate-6", "lg:-rotate-3", "lg:-rotate-6"]

export function Process() {
  const { label, title } = site.home.process

  if (site.process.length === 0) return null

  return (
    <section aria-labelledby="process-title" className="mt-28">
      <SectionHeader id="process-title" label={label} title={title} />

      <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:flex lg:justify-center lg:gap-0 lg:px-6 lg:pt-6 lg:pb-4">
        {site.process.map((step, i) => (
          <li
            key={step.title}
            className={cn(
              "edge-light flex min-h-40 flex-col lg:min-h-52 rounded-2xl border bg-card p-6 shadow-[0_18px_40px_-20px_rgb(0_0_0/0.6)]",
              "transition-transform duration-500 ease-glide motion-reduce:transition-none",
              "lg:w-64 lg:shrink-0 lg:hover:z-10 lg:hover:-translate-y-3 lg:hover:rotate-0 lg:[&:not(:first-child)]:-ml-6",
              tilts[i % tilts.length]
            )}
          >
            <h3 className="text-xl font-medium tracking-[-0.02em]">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
            <span className="mt-auto pt-8 font-mono text-sm text-line-1 tabular-nums">
              [{String(i + 1).padStart(3, "0")}]
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}
