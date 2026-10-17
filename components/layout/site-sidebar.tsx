import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarSeparator,
} from "@/components/ui/sidebar"

import { NavLinks } from "./nav-links"
import { ProfileCard } from "./profile"
import { ShellCtas } from "./shell-ctas"
import { SocialLinks } from "./social-links"
import { ThemeToggle } from "./theme-toggle"

// Desktop (≥ lg) only: a floating panel inset from the viewport edge. Below lg the MobileHeader takes over.
export function SiteSidebar() {
  return (
    <Sidebar
      collapsible="none"
      aria-label="Site"
      style={{ viewTransitionName: "site-sidebar" }}
      className="fixed top-3 bottom-3 left-3 z-20 hidden h-auto overflow-hidden rounded-2xl border border-sidebar-border lg:flex"
    >
      <SidebarHeader className="gap-5 px-6 pt-8 pb-6">
        <ProfileCard priority />
        <SocialLinks className="justify-center" />
        <ShellCtas />
      </SidebarHeader>
      <SidebarSeparator className="mx-6" />
      <SidebarContent className="px-3.5 py-4">
        <NavLinks markerId="sidebar-marker" />
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border px-6 py-4">
        <ThemeToggle />
      </SidebarFooter>
    </Sidebar>
  )
}
