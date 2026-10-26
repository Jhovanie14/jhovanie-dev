"use client"

import { IconMoon, IconSun } from "@tabler/icons-react"
import { useTheme } from "next-themes"

// Icons switch via the `dark` class, so server and client render the same markup.
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <button
      type="button"
      aria-label="Toggle dark mode (D)"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="press grid size-10 place-items-center rounded-full text-muted-foreground hover:bg-surface hover:text-foreground"
    >
      <IconMoon aria-hidden stroke={1.75} className="size-[1.125rem] dark:hidden" />
      <IconSun aria-hidden stroke={1.75} className="hidden size-[1.125rem] dark:block" />
    </button>
  )
}
