import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandX,
  IconCalendar,
  IconMail,
} from "@tabler/icons-react"

import { buttonVariants } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { site } from "@/content/site"
import { cn } from "@/lib/utils"

const icons = {
  github: IconBrandGithub,
  linkedin: IconBrandLinkedin,
  x: IconBrandX,
  mail: IconMail,
  calendar: IconCalendar,
}

const links = [
  ...site.socials.map((social) => ({ ...social, external: true })),
  { label: "Email", href: `mailto:${site.email}`, icon: "mail" as const, external: false },
]

export function SocialLinks({ className }: { className?: string }) {
  return (
    <ul className={cn("flex items-center gap-1", className)}>
      {links.map(({ label, href, icon, external }) => {
        const Icon = icons[icon]

        return (
          <li key={href}>
            <Tooltip>
              <TooltipTrigger
                render={
                  <a
                    href={href}
                    aria-label={label}
                    className={buttonVariants({ variant: "ghost", size: "icon" })}
                    {...(external && { target: "_blank", rel: "noopener noreferrer" })}
                  />
                }
              >
                <Icon aria-hidden className="size-[1.125rem]" stroke={1.75} />
              </TooltipTrigger>
              <TooltipContent side="bottom">{label}</TooltipContent>
            </Tooltip>
          </li>
        )
      })}
    </ul>
  )
}
