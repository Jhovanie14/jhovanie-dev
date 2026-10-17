import type { Metadata } from "next"

import { PageTransition } from "@/components/layout/page-transition"

export const metadata: Metadata = { title: "About" }

// Placeholder: built out in Step 6.
export default function AboutPage() {
  return (
    <PageTransition>
      <h1 className="text-5xl font-semibold tracking-tight text-balance">About</h1>
    </PageTransition>
  )
}
