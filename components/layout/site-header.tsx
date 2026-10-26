"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { site } from "@/content/site"
import { navTransition, stationIndex } from "@/lib/navigation"

import { BookCall } from "./book-call"
import { ThemeToggle } from "./theme-toggle"

/** A plain bar: the name, three links, one action. It never takes part in page transitions. */
export function SiteHeader() {
  const pathname = usePathname()
  const current = stationIndex(pathname)

  return (
    <header style={{ viewTransitionName: "site-header" }} className="sticky top-0 z-40 bg-background">
      <div className="frame flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          transitionTypes={navTransition(pathname, "/")}
          aria-current={pathname === "/" ? "page" : undefined}
          className="font-medium whitespace-nowrap"
        >
          {site.name}
        </Link>

        <div className="flex items-center gap-1 sm:gap-3">
          <nav aria-label="Main">
            <ul className="flex items-center gap-4 text-small sm:gap-6">
              {site.nav.map((item, i) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    transitionTypes={navTransition(pathname, item.href)}
                    aria-current={i === current ? "page" : undefined}
                    className="link text-muted-foreground hover:text-foreground aria-[current=page]:text-foreground aria-[current=page]:decoration-current"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <ThemeToggle />
          <BookCall className="hidden h-10 sm:inline-flex" />
        </div>
      </div>
    </header>
  )
}
