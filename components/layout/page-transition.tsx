import { ViewTransition } from "react"

// Maps the nav's transition types to the directional CSS classes in globals.css.
// Untyped transitions (browser back/forward, refresh) don't animate.
const directional = {
  "nav-forward": "nav-forward",
  "nav-back": "nav-back",
  default: "none",
}

/** Wrap each page.tsx (never the layout: layouts persist, so enter/exit never fire). */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter={directional} exit={directional} default="none">
      <div className="w-full px-4 py-6 sm:px-6 md:px-10 md:py-10 lg:px-12 lg:pt-3 lg:pb-16">
        {children}
      </div>
    </ViewTransition>
  )
}
