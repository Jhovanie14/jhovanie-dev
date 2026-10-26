import { site } from "@/content/site"
import { buildInfo } from "@/lib/build-info"

/** A single quiet line: what this is, where to find me, and the build that made the page. */
export function SiteFooter() {
  const { commit } = buildInfo()
  const links = [{ label: "Email", href: `mailto:${site.email}` }, ...site.socials]

  return (
    <footer className="frame pt-[30svh] pb-8">
      <div className="flex flex-col gap-2 text-small text-muted-foreground sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-baseline sm:gap-6">
        <p>
          {site.name}, {site.footer.description.toLowerCase()}
        </p>
        <ul className="flex flex-wrap gap-x-6 gap-y-1">
          {links.map(({ label, href }) => (
            <li key={href}>
              <a
                href={href}
                {...(href.startsWith("http") && { target: "_blank", rel: "noopener noreferrer" })}
                className="link text-foreground"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
        <p className="tabular-nums sm:text-right">
          © {new Date().getFullYear()}
          {commit && ` · ${site.footer.build} ${commit}`}
        </p>
      </div>
    </footer>
  )
}
