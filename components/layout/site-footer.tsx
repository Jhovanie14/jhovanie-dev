import Image from "next/image"

import { CutEdge } from "@/components/stationery"
import { site } from "@/content/site"
import { isLinkAvailable } from "@/lib/assets"
import { buildInfo } from "@/lib/build-info"

/**
 * The back of the card (DESIGN.md §6): a sign-off, the address block with a
 * stamp, the name at full width, and the receipt of the build that made
 * this page.
 */
export function SiteFooter() {
  const build = buildInfo()
  const year = new Date().getFullYear()
  const { title, message } = site.footer

  const addresses = [
    { label: site.email, href: `mailto:${site.email}` },
    ...site.socials.map(({ label, href }) => ({ label, href })),
    ...(site.cvUrl && isLinkAvailable(site.cvUrl) ? [{ label: site.about.cv, href: site.cvUrl }] : []),
  ]

  const receipt = [
    `© ${year} ${site.name}`,
    `Next.js ${build.next}`,
    build.commit && `${site.footer.build} ${build.commit}`,
    build.builtAt,
  ].filter(Boolean)

  return (
    <footer aria-labelledby="footer-title" className="pt-24 lg:pt-32">
      <div className="frame pb-4">
        <CutEdge kind="scallop" side="top" className="text-card" />
        <div className="@container overflow-hidden rounded-b-2xl bg-card px-6 pt-10 pb-6 sm:px-10 lg:pt-14">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-6">
              <h2 id="footer-title" className="text-heading font-semibold text-balance">
                {title}
              </h2>
              <p className="mt-5 max-w-[42ch] text-body">{message}</p>
            </div>

            <div className="flex items-start justify-between gap-8 lg:col-span-5 lg:col-start-8">
              <ul className="flex flex-col gap-3 text-lead">
                {addresses.map(({ label, href }) => (
                  <li key={href}>
                    <a
                      href={href}
                      {...(href.startsWith("http") && { target: "_blank", rel: "noopener noreferrer" })}
                      className="underline decoration-transparent underline-offset-[0.2em] transition-[text-decoration-color] duration-200 hover:decoration-current"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
              {/* The stamp. */}
              <Image
                src={site.avatar.src}
                alt=""
                width={96}
                height={128}
                className="aspect-[3/4] w-16 shrink-0 rotate-3 bg-foreground object-cover p-1 sm:w-24"
              />
            </div>
          </div>

          <p aria-hidden className="mt-16 text-[12.6cqw] leading-[0.8] font-bold tracking-[-0.055em] whitespace-nowrap lg:mt-20">
            {site.name}
          </p>

          <p className="mt-6 flex flex-wrap gap-x-4 gap-y-1 text-small text-muted-foreground">
            {receipt.map((item) => (
              <span key={item as string}>{item}</span>
            ))}
            {site.credits.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-transparent underline-offset-[0.2em] transition-[text-decoration-color] duration-200 hover:decoration-current"
              >
                {label}
              </a>
            ))}
          </p>
        </div>
      </div>
    </footer>
  )
}
