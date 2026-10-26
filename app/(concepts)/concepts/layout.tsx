import type { Metadata } from "next"

import { ConceptNav } from "@/components/concepts/concept-nav"

// Design concepts under review; not linked from the site and not indexed.
export const metadata: Metadata = { title: "Concepts", robots: { index: false, follow: false } }

export default function ConceptsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh">
      <ConceptNav />
      {children}
    </div>
  )
}
