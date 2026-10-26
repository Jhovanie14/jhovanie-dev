import { Assembly, type Part } from "@/components/assembly/assembly"
import { ContactField } from "@/components/contact-field"
import { BookCall } from "@/components/layout/book-call"
import { site } from "@/content/site"

// Your project, as an assembly: the first call at the base, launch on top.
const parts: Part[] = site.process.map((p) => ({ id: p.title, title: p.title, caption: p.when, detail: p.description }))

/** The close: how a project with me is put together, and the two ways to start it. */
export function Contact({ as: Heading = "h2" }: { as?: "h1" | "h2" }) {
  const [soft, full] = site.contact.prompt

  return (
    <div className="frame pt-32 lg:pt-44">
      <Assembly parts={parts} label={site.assembly.process} size="md" reverse details="always">
        <Heading className="text-heading font-semibold text-balance">
          <span className="block text-muted-foreground">{soft}</span>
          <span className="block">{full}</span>
        </Heading>
        <div className="mt-6">
          <ContactField />
        </div>
        <p className="mt-3 text-small text-muted-foreground">{site.contact.next}</p>
        <BookCall className="mt-6 h-12 px-6 text-body" />
      </Assembly>
    </div>
  )
}
