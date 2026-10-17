"use client"

import { IconMoon, IconSun } from "@tabler/icons-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

// Labels and icons switch via the `dark` class, so server and client render the same markup.
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-muted-foreground">
        <span className="dark:hidden">Day map</span>
        <span className="hidden dark:inline">Night map</span>
      </span>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle theme"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            />
          }
        >
          <IconSun aria-hidden className="dark:hidden" stroke={1.75} />
          <IconMoon aria-hidden className="hidden dark:block" stroke={1.75} />
        </TooltipTrigger>
        <TooltipContent side="top">
          Switch map <kbd className="font-mono">D</kbd>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}
