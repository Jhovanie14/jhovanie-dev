import { Reveal } from "@/components/motion/reveal"
import { RiseText } from "@/components/motion/rise-text"
import { site } from "@/content/site"

/** What you can hire me for: two-ended rows in the column, the service left, its stack right. */
export function Services() {
  if (site.services.length === 0) return null

  return (
    <section aria-labelledby="services-title" className="frame pt-32 lg:pt-44">
      <div className="lg:pl-[16%]">
        <RiseText id="services-title" text={site.home.services.title} className="text-heading font-medium" />
        <Reveal className="column mt-8 flex flex-col gap-6">
          {site.services.map((service) => (
            <div key={service.title} className="grid gap-1 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-8">
              <div>
                <h3 className="font-medium">{service.title}</h3>
                <p className="text-muted-foreground">{service.description}</p>
              </div>
              <p className="text-small text-muted-foreground sm:max-w-[14rem] sm:pt-1 sm:text-right">
                {service.stack.join(", ")}
              </p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
