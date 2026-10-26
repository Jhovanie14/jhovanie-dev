import { IconCheck } from "@tabler/icons-react"

import { site } from "@/content/site"
import { buildInfo } from "@/lib/build-info"
import { cn } from "@/lib/utils"

/**
 * The build that produced this page, as `next build` reports it: real
 * version, real routes, real commit. An interface fragment (data-ui), so it
 * keeps a terminal's own type and marks.
 */
export function BuildReceipt({ className }: { className?: string }) {
  const { next, commit, builtAt } = buildInfo()
  const routes = site.nav.map((item) => item.href)

  return (
    <figure data-ui className={cn("overflow-hidden rounded-2xl bg-card", className)}>
      <pre className="overflow-x-auto p-6 font-mono text-[0.8125rem] leading-[1.75] text-muted-foreground sm:p-8">
        <code>
          <span className="text-foreground">$ next build</span>
          {"\n"}
          <span className="text-line-1">▲</span> Next.js {next}
          {"\n"}
          <IconCheck aria-label="done" stroke={3} className="inline size-[1em] align-[-0.15em] text-line-2" /> Compiled successfully
          {"\n\n"}
          <span className="text-foreground">Route (app)</span>
          {routes.map((route, i) => (
            <span key={route}>
              {"\n"}
              {i === 0 ? "┌" : i === routes.length - 1 ? "└" : "├"} <span className="text-line-2">○</span>{" "}
              <span className="text-foreground">{route}</span>
            </span>
          ))}
          {"\n\n"}
          <span className="text-line-2">○</span> (Static) prerendered as static content
        </code>
      </pre>
      <figcaption className="bg-muted px-6 py-4 text-small text-muted-foreground sm:px-8">
        The build that made this page{commit ? `: commit ${commit}` : ""}, {builtAt}.
      </figcaption>
    </figure>
  )
}
