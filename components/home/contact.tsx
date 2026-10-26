import { ContactField } from "@/components/contact-field"
import { BookCall } from "@/components/layout/book-call"
import { Reveal } from "@/components/motion/reveal"
import { site } from "@/content/site"

/** The invitation: two lines, the address as the one field, and the call. */
export function Contact({ as: Heading = "h2" }: { as?: "h1" | "h2" }) {
  const [soft, full] = site.contact.prompt

  return (
    <section aria-labelledby="contact-title" className="frame pt-40 lg:pt-52">
      <Reveal className="column lg:ml-[16%]">
        <Heading id="contact-title" className="text-heading font-medium text-balance">
          <span className="block text-muted-foreground">{soft}</span>
          <span className="block">{full}</span>
        </Heading>
        <div className="mt-8">
          <ContactField />
        </div>
        <p className="mt-4 text-small text-muted-foreground">{site.contact.next}</p>
        <BookCall className="mt-8" />
      </Reveal>
    </section>
  )
}
