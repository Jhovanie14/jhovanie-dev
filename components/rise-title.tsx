import { cn } from "@/lib/utils"

/**
 * Letters rise out of a mask one after another (CSS only, so it plays on
 * every page enter and needs no JS). Screen readers get the plain text.
 */
export function RiseTitle({
  text,
  className,
  children,
}: {
  text: string
  className?: string
  children?: React.ReactNode
}) {
  return (
    <h1 className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden className="inline-flex overflow-hidden pb-[0.08em]">
        {Array.from(text).map((char, i) => (
          <span
            key={i}
            className={cn("rise-letter inline-block", char === " " && "w-[0.25em]")}
            style={{ animation: `rise 0.9s var(--ease-glide) ${120 + i * 45}ms both` }}
          >
            {char}
          </span>
        ))}
      </span>
      {children}
    </h1>
  )
}
