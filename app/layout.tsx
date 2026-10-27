import type { Metadata } from "next"
import { Onest, Unbounded } from "next/font/google"

import "./globals.css"
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
  description: `${site.role}. ${site.intro}`,
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
        {/* The intro panel's fade-in keys off html.js, so without JavaScript nothing waits to be revealed. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
