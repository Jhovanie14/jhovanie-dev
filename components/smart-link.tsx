import Link from "next/link"

import { linkKind } from "@/lib/links"
import { navTransition } from "@/lib/navigation"

type SmartLinkProps = Omit<React.ComponentProps<"a">, "href"> & {
  href: string
  /** Current path, so route links get the right view transition direction. */
  from?: string
}

/** Routes use next/link (with transition types), external URLs open in a new tab, files are plain links. */
export function SmartLink({ href, from, ...props }: SmartLinkProps) {
  const kind = linkKind(href)

  if (kind === "route") {
    return (
      <Link
        href={href}
        transitionTypes={from === undefined ? undefined : navTransition(from, href)}
        {...props}
      />
    )
  }

  if (kind === "external") {
    return <a href={href} target="_blank" rel="noopener noreferrer" {...props} />
  }

  return <a href={href} {...props} />
}
