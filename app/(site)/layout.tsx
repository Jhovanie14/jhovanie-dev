import { MobileHeader } from "@/components/layout/mobile-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteSidebar } from "@/components/layout/site-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"

/** The current site's shell: floating sidebar, mobile top bar, footer card. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider style={{ "--sidebar-width": "18rem" } as React.CSSProperties}>
      <a
        href="#content"
        className="sr-only rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
      >
        Skip to content
      </a>
      <SiteSidebar />
      <div className="flex min-w-0 flex-1 flex-col lg:pl-[calc(var(--sidebar-width)+0.75rem)]">
        <MobileHeader />
        <main id="content" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </div>
    </SidebarProvider>
  )
}
