import { existsSync, readFileSync } from "node:fs"
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

/**
 * Server only. A PNG or JPEG's pixel size, read from its header, so the full-size
 * viewer can lay images out before they load. Other formats get a stand-in
 * size; the browser corrects the shape once the image arrives.
 */
export function imageSize(src: string): { width: number; height: number } {
  const buf = readFileSync(path.join(process.cwd(), "public", decodeURI(src)))
  if (buf.toString("ascii", 1, 4) === "PNG") return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    // Walk the JPEG segments to the frame header (SOF0..SOF15, skipping DHT, JPG and DAC).
    for (let i = 2; i + 9 < buf.length; i += 2 + buf.readUInt16BE(i + 2)) {
      const marker = buf[i + 1]
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return { width: buf.readUInt16BE(i + 7), height: buf.readUInt16BE(i + 5) }
      }
    }
  }
  return { width: 1600, height: 1000 }
}
