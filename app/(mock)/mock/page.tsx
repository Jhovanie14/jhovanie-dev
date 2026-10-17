import Image from "next/image"
import Link from "next/link"
import {
  IconArrowRight,
  IconArrowUpRight,
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandX,
} from "@tabler/icons-react"

import { CopyEmail } from "@/components/copy-email"
import { LocalTime } from "@/components/home/local-time"
import { ScrollNav } from "@/components/mock/scroll-nav"
import { ProjectCover } from "@/components/projects/project-cover"
import { site, type Experience } from "@/content/site"
import { projectLine } from "@/lib/projects"

/*
 * "Quiet senior" mock of the Home page, for review before replacing the
 * current design. Content still comes from site.ts (placeholders included).
 */

const socialIcons = { github: IconBrandGithub, linkedin: IconBrandLinkedin, x: IconBrandX }

const monthYear = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" })
const fmt = (v: string) => monthYear.format(new Date(`${v}-01T00:00:00Z`))
const range = (r: Experience) => `${fmt(r.start)} — ${r.end === "present" ? "Now" : fmt(r.end)}`

// Proper nouns carry the weight in prose: bold every tool named in site.skills.
const tools = site.skills.flatMap((g) => g.items).sort((a, b) => b.length - a.length)
const toolPattern = new RegExp(`(${tools.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "g")

function Prose({ text }: { text: string }) {
  return (
    <p>
      {text.split(toolPattern).map((part, i) =>
        tools.includes(part) ? (
          <strong key={i} className="font-medium text-foreground">
            {part}
          </strong>
        ) : (
          part
        )
      )}
    </p>
  )
}

function Tags({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 flex flex-wrap gap-1.5" aria-label={site.ui.stack}>
      {items.map((t) => (
        <li
          key={t}
          className="rounded-full bg-line-1/10 px-2.5 py-0.5 text-xs font-medium text-line-1"
        >
          {t}
        </li>
      ))}
    </ul>
  )
}

/** Mobile-only sticky section heading; on desktop the left nav names the section. */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky top-0 z-20 -mx-6 mb-6 bg-background/80 px-6 py-4 backdrop-blur md:-mx-12 md:px-12 lg:sr-only">
      <h2 className="text-sm font-semibold text-foreground">{children}</h2>
    </div>
  )
}

// The list hover: the hovered item lifts onto a faint surface, its siblings dim.
const listItem =
  "group/item relative grid gap-4 pb-1 transition-opacity duration-300 sm:grid-cols-8 sm:gap-8 lg:group-hover/list:opacity-50 lg:hover:!opacity-100 lg:focus-within:!opacity-100"
const itemSurface =
  "absolute -inset-x-4 -inset-y-4 z-0 hidden rounded-lg transition-colors duration-300 lg:-inset-x-6 lg:block lg:group-hover/item:bg-card/70 lg:group-hover/item:shadow-[inset_0_1px_0_0_rgb(255_255_255/0.06)]"

export default function MockHome() {
  const projects = site.projects.slice(0, 4)

  return (
    <div className="relative z-10 mx-auto min-h-svh max-w-screen-xl px-6 py-12 md:px-12 md:py-20 lg:px-24 lg:py-0">
      <div className="lg:flex lg:justify-between lg:gap-4">
        {/* ---------- Left column: fixed while the right scrolls ---------- */}
        <header className="lg:sticky lg:top-0 lg:flex lg:max-h-screen lg:w-[44%] lg:flex-col lg:justify-between lg:py-24">
          <div>
            <Image
              src={site.avatar.src}
              alt={site.avatar.alt}
              width={56}
              height={56}
              priority
              className="size-14 rounded-full object-cover ring-2 ring-line-1/70 ring-offset-4 ring-offset-background"
            />
            <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
              <Link href="/mock">{site.name}</Link>
            </h1>
            <p className="mt-3 text-lg font-medium tracking-tight">{site.role}</p>
            <p className="mt-4 max-w-xs leading-relaxed text-muted-foreground">{site.bio.short}</p>
            {site.availability.open && (
              <p className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground">
                <span className="relative flex size-2">
                  <span className="absolute inset-0 animate-ping rounded-full bg-line-2/60 motion-reduce:hidden" />
                  <span className="relative size-2 rounded-full bg-line-2" />
                </span>
                {site.availability.label}
              </p>
            )}

            <ScrollNav
              items={[
                { id: "about", label: "About" },
                { id: "experience", label: "Experience" },
                { id: "projects", label: "Projects" },
              ]}
            />
          </div>

          <div className="mt-10 lg:mt-0">
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={site.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition-[filter] hover:brightness-110"
              >
                {site.cta.book}
                <IconArrowUpRight aria-hidden stroke={2} className="size-4" />
              </a>
              <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <a href={`mailto:${site.email}`} className="hover:text-foreground">
                  {site.email}
                </a>
                <CopyEmail className="size-8" />
              </span>
            </div>
            <div className="mt-8 flex items-center justify-between gap-4">
              <ul className="-ml-1.5 flex items-center gap-1">
                {site.socials.map(({ label, href, icon }) => {
                  const Icon = socialIcons[icon as keyof typeof socialIcons]
                  if (!Icon) return null
                  return (
                    <li key={href}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        className="grid size-9 place-items-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <Icon aria-hidden stroke={1.5} className="size-5" />
                      </a>
                    </li>
                  )
                })}
              </ul>
              <span className="text-xs text-muted-foreground">
                <LocalTime timeZone={site.timezone} label={site.home.localTimeLabel} />
              </span>
            </div>
          </div>
        </header>

        {/* ---------- Right column ---------- */}
        <main id="content" className="pt-20 lg:w-[52%] lg:py-24">
          <section id="about" aria-label="About" className="scroll-mt-16 lg:scroll-mt-24">
            <SectionTitle>About</SectionTitle>
            <div className="space-y-4 text-[1.0625rem] leading-relaxed text-muted-foreground">
              <Prose text={site.bio.long} />
            </div>
          </section>

          <section id="experience" aria-label="Experience" className="mt-24 scroll-mt-16 lg:mt-36 lg:scroll-mt-24">
            <SectionTitle>Experience</SectionTitle>
            <ol className="group/list flex flex-col gap-12">
              {site.experience.map((role) => (
                <li key={`${role.company}-${role.start}`} className={listItem}>
                  <span aria-hidden className={itemSurface} />
                  <p className="relative z-10 mt-1 font-mono text-xs text-muted-foreground uppercase sm:col-span-2">
                    {range(role)}
                  </p>
                  <div className="relative z-10 sm:col-span-6">
                    <h3 className="font-medium leading-snug text-foreground">
                      {role.title} · <span className="group-hover/item:text-line-1">{role.company}</span>
                    </h3>
                    {role.highlights.map((h) => (
                      <p key={h} className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {h}
                      </p>
                    ))}
                    {role.stack.length > 0 && <Tags items={role.stack} />}
                  </div>
                </li>
              ))}
            </ol>
            <Link
              href="/about"
              className="group mt-12 inline-flex items-center gap-1.5 font-medium text-foreground"
            >
              Full experience
              <IconArrowRight aria-hidden stroke={2} className="size-4 transition-transform duration-300 ease-glide group-hover:translate-x-1" />
            </Link>
          </section>

          <section id="projects" aria-label="Projects" className="mt-24 scroll-mt-16 lg:mt-36 lg:scroll-mt-24">
            <SectionTitle>Projects</SectionTitle>
            <ul className="group/list flex flex-col gap-12">
              {projects.map((project) => (
                <li
                  key={project.slug}
                  className={listItem}
                  style={{ "--line": projectLine(project) } as React.CSSProperties}
                >
                  <span aria-hidden className={itemSurface} />
                  <div className="relative z-10 order-2 sm:order-1 sm:col-span-2">
                    <ProjectCover
                      project={project}
                      sizes="160px"
                      className="w-32 rounded-md border transition-colors group-hover/item:border-(--line)/50 sm:w-full"
                    />
                  </div>
                  <div className="relative z-10 order-1 sm:order-2 sm:col-span-6">
                    <h3 className="font-medium leading-snug text-foreground">
                      <Link
                        href={`/projects/${project.slug}`}
                        className="inline-flex items-baseline gap-1 before:absolute before:-inset-x-4 before:-inset-y-4 before:rounded-lg lg:before:-inset-x-6"
                      >
                        <span className="group-hover/item:text-(--line)">{project.title}</span>
                        <IconArrowUpRight
                          aria-hidden
                          stroke={2}
                          className="size-4 translate-y-0.5 transition-transform duration-300 ease-glide group-hover/item:translate-x-0.5 group-hover/item:-translate-y-0"
                        />
                      </Link>
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{project.summary}</p>
                    <p className="mt-2 text-sm text-foreground/80">{project.outcome}</p>
                    <Tags items={project.stack} />
                  </div>
                </li>
              ))}
            </ul>
            <Link
              href="/projects"
              className="group mt-12 inline-flex items-center gap-1.5 font-medium text-foreground"
            >
              All projects
              <IconArrowRight aria-hidden stroke={2} className="size-4 transition-transform duration-300 ease-glide group-hover:translate-x-1" />
            </Link>
          </section>

          <footer className="mt-32 max-w-md pb-16 text-sm leading-relaxed text-muted-foreground lg:pb-0">
            Designed and built by {site.name} with Next.js and Tailwind CSS, deployed on Vercel. Set in
            Geist.
          </footer>
        </main>
      </div>
    </div>
  )
}
