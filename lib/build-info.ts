import { execSync } from "node:child_process"
import { readFileSync } from "node:fs"
import path from "node:path"

/**
 * Server only. Facts about the build that produced this page: the commit,
 * the Next.js version and when it was built. Pages are static, so this
 * runs once per deploy and the footer shows the real receipt.
 */
export type BuildInfo = { commit: string | null; next: string; builtAt: string }

let cached: BuildInfo | undefined

function commit() {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA
  if (sha) return sha.slice(0, 7)
  try {
    return execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim()
  } catch {
    return null // not a git checkout (e.g. a tarball deploy)
  }
}

function nextVersion() {
  const pkg = path.join(process.cwd(), "node_modules", "next", "package.json")
  return (JSON.parse(readFileSync(pkg, "utf8")) as { version: string }).version
}

const day = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
})

export function buildInfo(): BuildInfo {
  cached ??= { commit: commit(), next: nextVersion(), builtAt: day.format(new Date()) }
  return cached
}
