import { site } from "@/content/site"
import { cn } from "@/lib/utils"

/** The site's one primary action: a solid pill in signal orange. */
export function BookCall({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <a
      href={site.bookingUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "press inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-primary px-5 text-small font-semibold text-primary-foreground hover:bg-primary/85",
        className
      )}
    >
      {children ?? site.cta.book}
    </a>
  )
}
