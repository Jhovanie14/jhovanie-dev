import type { Metadata } from "next"
import { Overpass, Overpass_Mono } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { site } from "@/content/site"
import { cn } from "@/lib/utils"

const overpass = Overpass({ subsets: ["latin"], variable: "--font-overpass" })

const overpassMono = Overpass_Mono({
  subsets: ["latin"],
  variable: "--font-overpass-mono",
})

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
      className={cn("antialiased", overpass.variable, overpassMono.variable, "font-sans")}
    >
      <body>
        <ThemeProvider defaultTheme="dark">
          <TooltipProvider delay={300}>
            {children}
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
