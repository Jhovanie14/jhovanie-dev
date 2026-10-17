import { cn } from "@/lib/utils"

/** Small pill label on the left, big title on the right (stacked on mobile). */
export function SectionHeader({
  id,
  label,
  title,
  className,
}: {
  id: string
  label: string
  title: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-10",
        className
      )}
    >
      <SectionLabel>{label}</SectionLabel>
      <h2
        id={id}
        className="text-4xl font-medium tracking-[-0.035em] text-balance sm:text-right sm:text-5xl"
      >
        {title}
      </h2>
    </div>
  )
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-fit w-fit shrink-0 items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
      <span aria-hidden className="size-1.5 rounded-full bg-line-1" />
      {children}
    </span>
  )
}
