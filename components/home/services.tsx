import { Reveal } from "@/components/motion/reveal"
import { RiseText } from "@/components/motion/rise-text"
import { site } from "@/content/site"

/** What you can hire me for, as a bill of materials: the part, its spec, what it is made of. */
export function Services() {
  if (site.services.length === 0) return null

  return (
    <section aria-labelledby="services-title" className="frame pt-32 lg:pt-44">
      <RiseText id="services-title" text={site.home.services.title} className="text-heading font-semibold" />
      <Reveal className="mt-8" each={0}>
        <table className="w-full text-left">
          <caption className="sr-only">{site.home.services.title}</caption>
          <thead>
            <tr className="border-b-2 border-foreground text-small text-muted-foreground">
              <th scope="col" className="pb-2 font-semibold">Part</th>
              <th scope="col" className="hidden pb-2 font-semibold sm:table-cell">Spec</th>
              <th scope="col" className="pb-2 text-right font-semibold">Made of</th>
            </tr>
          </thead>
          <tbody>
            {site.services.map((s) => (
              <tr key={s.title} className="border-b border-border align-top">
                <th scope="row" className="py-4 pr-6">
                  <span className="text-lead font-semibold">{s.title}</span>
                  <span className="mt-1 block font-normal text-muted-foreground sm:hidden">{s.description}</span>
                </th>
                <td className="hidden py-4 pr-6 sm:table-cell">{s.description}</td>
                <td className="py-4 text-right text-small text-muted-foreground">{s.stack.join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Reveal>
    </section>
  )
}
