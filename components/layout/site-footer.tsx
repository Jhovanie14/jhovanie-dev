import Image from "next/image"
import { IconMail, IconMapPin } from "@tabler/icons-react"

import { site } from "@/content/site"

import { SocialLinks } from "./social-links"

/** Footer card on every page: portrait, name, contact and socials. */
export function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="px-4 pb-6 sm:px-6 md:px-10 lg:px-12">
      <div className="edge-light rounded-2xl border bg-card p-5 sm:p-8">
        <div className="grid gap-8 sm:grid-cols-[auto_minmax(0,1fr)] lg:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)]">
          <Image
            src={site.avatar.src}
            alt={site.avatar.alt}
            width={176}
            height={176}
            className="size-36 rounded-xl border object-cover sm:size-44"
          />
          <div className="flex flex-col">
            <p className="text-3xl font-medium tracking-[-0.03em]">{site.name}</p>
            <p className="mt-1 text-muted-foreground">{site.role}</p>
            <SocialLinks className="mt-auto -ml-2 pt-6" />
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <p className="text-lg font-medium">{site.footer.contactTitle}</p>
            <ul className="mt-4 flex flex-col gap-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-3">
                <span aria-hidden className="grid size-8 place-items-center rounded-md border text-line-1">
                  <IconMapPin stroke={1.75} className="size-4" />
                </span>
                {site.location}
              </li>
              <li className="flex items-center gap-3">
                <span aria-hidden className="grid size-8 place-items-center rounded-md border text-line-1">
                  <IconMail stroke={1.75} className="size-4" />
                </span>
                <a href={`mailto:${site.email}`} className="hover:text-foreground hover:underline">
                  {site.email}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 flex flex-col gap-2 border-t border-dashed pt-5 text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <p>
            © {year} {site.name}
          </p>
          <p>{site.footer.builtWith}</p>
        </div>
      </div>
    </footer>
  )
}
