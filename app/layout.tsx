import type { Metadata } from "next"
import { Onest, Unbounded } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { site } from "@/content/site"
import { cn } from "@/lib/utils"

// Unbounded for display (and the lettering drawn into the 3D room), Onest for reading.
const unbounded = Unbounded({ subsets: ["latin"], variable: "--font-unbounded" })
const onest = Onest({ subsets: ["latin"], variable: "--font-onest" })

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} · ${site.role}`,
    template: `%s · ${site.name}`,
  },
  description: site.bio.short,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={cn("antialiased", unbounded.variable, onest.variable, "font-sans")}
    >
      <head>
        {/* Motion gates key off html.js, so without JavaScript nothing waits to be revealed (DESIGN.md §5). */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <ThemeProvider defaultTheme="dark" forcedTheme="dark">
          <TooltipProvider delay={300}>
            {children}
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
