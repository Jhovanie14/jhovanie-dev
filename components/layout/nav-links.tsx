"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { IconHome, IconLayoutGrid, IconMail, IconUser } from "@tabler/icons-react"
import { MotionConfig, motion } from "motion/react"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { site } from "@/content/site"
import { spring } from "@/lib/motion"
import { navTransition, stationIndex } from "@/lib/navigation"
import { cn } from "@/lib/utils"

const icons = {
  home: IconHome,
  projects: IconLayoutGrid,
  about: IconUser,
  contact: IconMail,
}

/**
 * The nav drawn as a route line: each page is a station disc on the line,
 * and the active page's pill glides between stations.
 * `markerId` must be unique per mounted instance (sidebar vs. mobile sheet).
 */
export function NavLinks({
  markerId,
  onNavigate,
}: {
  markerId: string
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const current = stationIndex(pathname)

  return (
    <MotionConfig reducedMotion="user">
      <nav aria-label="Main">
        <SidebarMenu className="relative gap-1">
          <span
            aria-hidden
            className="absolute top-5 bottom-5 left-[1.1875rem] w-0.5 rounded-full bg-line-1/35"
          />
          {site.nav.map((item, index) => {
            const isActive = index === current
            const Icon = icons[item.icon]

            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  isActive={isActive}
                  className="isolate h-11 gap-3 rounded-full px-2.5 text-[0.9375rem] text-muted-foreground hover:bg-transparent hover:text-foreground data-active:bg-transparent data-active:font-semibold data-active:text-foreground [&_svg]:size-[1.125rem]"
                  render={
                    <Link
                      href={item.href}
                      transitionTypes={navTransition(pathname, item.href)}
                      aria-current={isActive ? "page" : undefined}
                      onNavigate={onNavigate}
                    />
                  }
                >
                  <span aria-hidden className="grid size-5 shrink-0 place-items-center">
                    <span
                      className={cn(
                        "size-2.5 rounded-full border-2 border-line-1 transition-colors duration-300",
                        isActive ? "bg-line-1" : "bg-sidebar"
                      )}
                    />
                  </span>
                  {isActive && (
                    <motion.span
                      aria-hidden
                      layoutId={markerId}
                      transition={spring.marker}
                      className="absolute inset-y-0 right-0 left-[2.125rem] -z-10 rounded-full border border-sidebar-border bg-sidebar-accent"
                    />
                  )}
                  <Icon aria-hidden stroke={1.75} className="ml-1" />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </nav>
    </MotionConfig>
  )
}
