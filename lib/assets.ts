import { existsSync } from "node:fs"
import path from "node:path"

import { linkKind } from "./links"

/** Server only. True when a "/..." path exists in public/ (pages are static, so this runs at build). */
export function hasPublicFile(src: string) {
  return existsSync(path.join(process.cwd(), "public", decodeURI(src)))
}

/** Drops links to public files that haven't been added yet (e.g. a CV). */
export function isLinkAvailable(href: string) {
  return linkKind(href) !== "file" || hasPublicFile(href)
}
