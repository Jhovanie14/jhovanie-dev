import { site } from "@/content/site"
import { cn } from "@/lib/utils"

/** The one primary action: a small solid cobalt pill. */
export function BookCall({ className }: { className?: string }) {
  return (
    <a
      href={site.bookingUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "press inline-flex h-11 shrink-0 items-center justify-center rounded-full bg-primary px-5 text-small font-medium text-primary-foreground hover:bg-primary-hover",
        className
      )}
    >
      {site.cta.book}
    </a>
  )
}
