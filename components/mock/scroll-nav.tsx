"use client"

import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"

/**
 * Section nav whose active item's route line extends as you scroll
 * (scroll-spy on the right column's sections).
 */
export function ScrollNav({ items }: { items: { id: string; label: string }[] }) {
  const [active, setActive] = useState(items[0]?.id)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id)
      },
      { rootMargin: "-20% 0px -70% 0px" }
    )
    for (const { id } of items) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [items])

  return (
    <nav aria-label="On this page" className="hidden lg:block">
      <ul className="mt-14 flex w-max flex-col gap-1">
        {items.map(({ id, label }) => {
          const isActive = id === active
          return (
            <li key={id}>
              <a
                href={`#${id}`}
                aria-current={isActive ? "true" : undefined}
                className="group flex items-center gap-4 py-2.5"
              >
                <span
                  aria-hidden
                  className={cn(
                    "h-0.5 rounded-full transition-all duration-500 ease-glide",
                    isActive
                      ? "w-16 bg-line-1"
                      : "w-8 bg-muted-foreground/40 group-hover:w-16 group-hover:bg-foreground group-focus-visible:w-16"
                  )}
                />
                <span
                  className={cn(
                    "text-sm font-medium transition-colors duration-300",
                    isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                  )}
                >
                  {label}
                </span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
