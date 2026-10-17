import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import { CursorLight } from "@/components/mock/cursor-light"
import { cn } from "@/lib/utils"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

// Design mock for review ("Quiet senior"); not linked from the site.
export const metadata: Metadata = { robots: { index: false, follow: false } }

export default function MockLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        geist.variable,
        geistMono.variable,
        "relative min-h-svh font-[family-name:var(--font-geist)] [&_.font-mono]:font-[family-name:var(--font-geist-mono)]"
      )}
    >
      <CursorLight />
      {children}
    </div>
  )
}
