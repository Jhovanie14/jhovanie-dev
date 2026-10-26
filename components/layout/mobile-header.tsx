"use client"

import { useState } from "react"
import Link from "next/link"
import { IconMenu2 } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

import { NavLinks } from "./nav-links"
import { ProfileCard, ProfileRow } from "./profile"
import { ShellCtas } from "./shell-ctas"
import { SocialLinks } from "./social-links"
import { ThemeToggle } from "./theme-toggle"

// Below lg: compact top bar, nav in a Sheet.
export function MobileHeader() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <header
      style={{ viewTransitionName: "site-topbar" }}
      className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b bg-background px-4 lg:hidden"
    >
      <Link href="/" className="min-w-0 rounded-md" onNavigate={close}>
        <ProfileRow />
      </Link>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={<Button variant="ghost" size="icon-lg" aria-label="Open menu" />}
        >
          <IconMenu2 aria-hidden stroke={1.75} />
        </SheetTrigger>
        <SheetContent side="right" className="w-[min(20rem,88vw)] gap-0 bg-sidebar p-0">
          <SheetHeader className="gap-5 px-6 pt-8 pb-6">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <SheetDescription className="sr-only">Site navigation and links</SheetDescription>
            <ProfileCard />
            <SocialLinks className="justify-center" />
            <ShellCtas onNavigate={close} />
          </SheetHeader>
          <div className="flex-1 overflow-y-auto border-t border-sidebar-border px-3.5 py-4">
            <NavLinks onNavigate={close} />
          </div>
          <div className="border-t border-sidebar-border px-6 py-4">
            <ThemeToggle />
          </div>
        </SheetContent>
      </Sheet>
    </header>
  )
}
