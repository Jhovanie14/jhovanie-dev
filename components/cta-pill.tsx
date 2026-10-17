import { IconArrowUpRight } from "@tabler/icons-react"

import { SmartLink } from "@/components/smart-link"
import { cn } from "@/lib/utils"

const variants = {
  primary: "bg-primary text-primary-foreground",
  outline: "border border-border bg-transparent text-foreground group-hover/pill:border-line-1/60",
}

/** A pill label with a detached round arrow, which turns to point right on hover. */
export function CtaPill({
  href,
  from,
  variant = "primary",
  children,
  className,
}: {
  href: string
  from?: string
  variant?: keyof typeof variants
  children: React.ReactNode
  className?: string
}) {
  return (
    <SmartLink href={href} from={from} className={cn("group/pill inline-flex items-center rounded-full", className)}>
      <span
        className={cn(
          "inline-flex h-11 items-center rounded-full px-5 text-[0.9375rem] font-semibold transition-colors duration-300",
          variants[variant]
        )}
      >
        {children}
      </span>
      <span
        aria-hidden
        className={cn(
          "grid size-11 place-items-center rounded-full transition-colors duration-300",
          variants[variant]
        )}
      >
        <IconArrowUpRight
          stroke={2}
          className="size-5 transition-transform duration-300 ease-glide group-hover/pill:rotate-45"
        />
      </span>
    </SmartLink>
  )
}
