export type LinkKind = "route" | "file" | "external"

/** href: a route ("/about"), a public file ("/cv.pdf"), or an external URL. */
export function linkKind(href: string): LinkKind {
  if (!href.startsWith("/")) return "external"
  return /\.[a-z0-9]+$/i.test(href) ? "file" : "route"
}
