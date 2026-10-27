import * as THREE from "three"

import { site, yearSpan } from "@/content/site"
import { gsap } from "@/lib/gsap"

import { canvasTexture, redraw, wrap } from "./textures"

/*
 * The shelf's books open. Choosing a skill pulls its book off the shelf; it
 * turns to show its cover, comes forward, and the cover swings open on two
 * pages: the skill, and every project and role that used it (worked out from
 * the content, so new work shows up on its own).
 */

/** A book on the shelf, as the room builds it. */
export type ShelfBook = { group: THREE.Group; mesh: THREE.Mesh; tool: string; color: string }
type Fonts = { display: string; body: string }

const PAGE = { w: 0.2, h: 0.28, px: 640 }
const PAGE_PX_H = Math.round(PAGE.px * (PAGE.h / PAGE.w))
const paper = "#F4EFE6"
const ink = "#15181B"
const grey = "#6B6760"
const orange = "#FF7A1A"
/** Where the open book is held: in front of the shelf, at reading height. */
const READ_AT = new THREE.Vector3(-0.27, 2.02, -0.3)

/** Words a stack entry may use for a skill, where they differ from its name. */
const ALIASES: Record<string, string[]> = {
  "Tailwind CSS": ["tailwind"],
  PostgreSQL: ["postgres"],
  "Next.js": ["next.js"],
  "shadcn/ui": ["shadcn"],
}
/** Skills a stack implies without naming them: Laravel is PHP, Next.js is React. */
const IMPLIED: Record<string, string[]> = {
  PHP: ["laravel"],
  React: ["next.js"],
}
const mentions = (stack: string[], skill: string) => {
  const words = [...(ALIASES[skill] ?? [skill.toLowerCase()]), ...(IMPLIED[skill] ?? [])]
  return stack.some((entry) => words.some((w) => new RegExp(`(^|[^a-z])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z]|$)`).test(entry.toLowerCase())))
}

/** The projects and roles whose stack includes `skill`. */
export function skillUses(skill: string) {
  return {
    projects: site.projects.filter((p) => mentions(p.stack, skill)),
    roles: site.experience.filter((e) => mentions(e.stack, skill)),
  }
}

const groupOf = (skill: string) => site.skills.find((g) => g.items.includes(skill))?.group ?? ""

function drawLeft(ctx: CanvasRenderingContext2D, skill: string, f: Fonts) {
  const { projects, roles } = skillUses(skill)
  const w = PAGE.px
  ctx.fillStyle = paper
  ctx.fillRect(0, 0, w, PAGE_PX_H)
  // The gutter's shade, towards the spine on the right.
  ctx.fillStyle = "rgba(0,0,0,0.06)"
  ctx.fillRect(w - 26, 0, 26, PAGE_PX_H)
  ctx.fillStyle = grey
  ctx.font = `600 28px ${f.body}`
  ctx.fillText(groupOf(skill).toUpperCase(), 56, 110)
  ctx.fillStyle = ink
  let size = 76
  do ctx.font = `800 ${size}px ${f.display}`
  while (ctx.measureText(skill).width > w - 112 && (size -= 4) > 36)
  ctx.fillText(skill, 56, 210)
  ctx.fillStyle = orange
  ctx.fillRect(56, 248, 90, 8)
  ctx.fillStyle = ink
  ctx.font = `500 34px ${f.body}`
  const n = projects.length
  const line = n > 0 ? `Used in ${n} ${n === 1 ? "project" : "projects"}` : "Part of the daily workflow"
  ctx.fillText(line, 56, 330)
  if (roles.length > 0) {
    ctx.fillStyle = grey
    ctx.fillText(`across ${roles.length} ${roles.length === 1 ? "role" : "roles"}`, 56, 380)
  }
  ctx.fillStyle = grey
  ctx.font = `400 26px ${f.body}`
  ctx.fillText("Click the book to close it", 56, PAGE_PX_H - 60)
}

function drawRight(ctx: CanvasRenderingContext2D, skill: string, f: Fonts) {
  const { projects, roles } = skillUses(skill)
  const w = PAGE.px
  ctx.fillStyle = paper
  ctx.fillRect(0, 0, w, PAGE_PX_H)
  ctx.fillStyle = "rgba(0,0,0,0.06)"
  ctx.fillRect(0, 0, 26, PAGE_PX_H)
  let y = 110
  const heading = (text: string) => {
    ctx.fillStyle = grey
    ctx.font = `600 26px ${f.body}`
    ctx.fillText(text.toUpperCase(), 60, y)
    y += 58
  }
  const entry = (title: string, meta: string) => {
    if (y > PAGE_PX_H - 80) return
    ctx.fillStyle = orange
    ctx.fillRect(60, y - 22, 12, 12)
    ctx.fillStyle = ink
    ctx.font = `600 32px ${f.body}`
    const lines = wrap(ctx, title, w - 150).slice(0, 2)
    lines.forEach((l, k) => ctx.fillText(l, 92, y + k * 38))
    y += lines.length * 38
    ctx.fillStyle = grey
    ctx.font = `400 25px ${f.body}`
    ctx.fillText(meta, 92, y)
    y += 54
  }
  if (projects.length) {
    heading("Projects")
    projects.forEach((p) => entry(p.title, `${p.year} · ${p.category}`))
  }
  if (roles.length) {
    y += 10
    heading("Roles")
    roles.forEach((r) => entry(r.company, `${r.title} · ${yearSpan(r.start, r.end)}`))
  }
  if (!projects.length && !roles.length) {
    ctx.fillStyle = ink
    ctx.font = `500 32px ${f.body}`
    wrap(ctx, "Used every day for AI-assisted development, architecture review and code quality.", w - 120).forEach((l, k) => ctx.fillText(l, 60, 130 + k * 44))
  }
}

/**
 * The reader: one open book, reused for whichever skill is chosen. `open(tool)`
 * pulls that book off the shelf and opens it; `open(null)` puts it back.
 */
export function createBookReader(scene: THREE.Scene, books: ShelfBook[], f: Fonts, opts: { reduce: boolean; aspect: () => number }) {
  const left = canvasTexture(PAGE.px, PAGE_PX_H, () => {})
  const right = canvasTexture(PAGE.px, PAGE_PX_H, () => {})
  const coverMat = new THREE.MeshStandardMaterial({ roughness: 0.7, color: "#2E5266" })
  const pageMat = (map: THREE.Texture) => new THREE.MeshStandardMaterial({ map, roughness: 0.9, emissive: "#ffffff", emissiveMap: map, emissiveIntensity: 0.35 })

  // The open book: the right page fixed, and the left leaf (page in front, cover behind) hinged at the spine.
  const root = new THREE.Group()
  const rightPage = new THREE.Mesh(new THREE.PlaneGeometry(PAGE.w, PAGE.h), pageMat(right))
  rightPage.position.x = PAGE.w / 2
  const backCover = new THREE.Mesh(new THREE.PlaneGeometry(PAGE.w + 0.008, PAGE.h + 0.008), coverMat)
  backCover.position.set(PAGE.w / 2, 0, -0.004)
  backCover.rotation.y = Math.PI
  const leaf = new THREE.Group()
  const leftPage = new THREE.Mesh(new THREE.PlaneGeometry(PAGE.w, PAGE.h), pageMat(left))
  leftPage.position.set(-PAGE.w / 2, 0, 0.002)
  const frontCover = new THREE.Mesh(new THREE.PlaneGeometry(PAGE.w + 0.008, PAGE.h + 0.008), coverMat)
  frontCover.position.set(-PAGE.w / 2, 0, -0.002)
  frontCover.rotation.y = Math.PI
  leaf.add(leftPage, frontCover)
  root.add(rightPage, backCover, leaf)
  root.visible = false
  scene.add(root)

  let current: ShelfBook | null = null
  let tl: gsap.core.Timeline | null = null
  const home = new Map(books.map((b) => [b, b.group.position.clone()]))
  const readScale = () => (opts.aspect() < 1 ? 1.3 : 1.45)

  // Closed, the leaf lies on the right page with its cover out; the book stands edge-on, spine to the room, where it left the shelf.
  const closedAt = (b: ShelfBook) => {
    const box = new THREE.Box3().setFromObject(b.mesh)
    const size = box.getSize(new THREE.Vector3())
    return { pos: home.get(b)!.clone().add(new THREE.Vector3(0, 0, 0.24)), scale: size.y / PAGE.h }
  }

  const putBack = (b: ShelfBook, t: gsap.core.Timeline) => {
    const at = closedAt(b)
    t.to(leaf.rotation, { y: -Math.PI, duration: 0.35, ease: "power2.in" })
      .to(root.position, { x: at.pos.x, y: at.pos.y, z: at.pos.z, duration: 0.45, ease: "power3.inOut" })
      .to(root.rotation, { y: -1.25, duration: 0.45, ease: "power3.inOut" }, "<")
      .to(root.scale, { x: at.scale, y: at.scale, z: at.scale, duration: 0.45, ease: "power3.inOut" }, "<")
      .call(() => {
        root.visible = false
        b.group.visible = true
        b.group.position.copy(at.pos)
      })
      .to(b.group.position, { z: home.get(b)!.z, duration: 0.3, ease: "power2.out" })
  }

  const takeOut = (b: ShelfBook, t: gsap.core.Timeline) => {
    const at = closedAt(b)
    t.call(() => {
      redraw(left, (ctx) => drawLeft(ctx, b.tool, f))
      redraw(right, (ctx) => drawRight(ctx, b.tool, f))
      coverMat.color.set(b.color)
    })
      .to(b.group.position, { z: at.pos.z, duration: 0.3, ease: "power2.out" })
      .call(() => {
        b.group.visible = false
        root.visible = true
        root.position.copy(at.pos)
        root.rotation.set(0, -1.25, 0)
        root.scale.setScalar(at.scale)
        leaf.rotation.y = -Math.PI
      })
      .to(root.position, { x: READ_AT.x, y: READ_AT.y, z: READ_AT.z, duration: 0.6, ease: "power3.inOut" })
      .to(root.rotation, { y: 0, duration: 0.6, ease: "power3.inOut" }, "<")
      .to(root.scale, { x: readScale(), y: readScale(), z: readScale(), duration: 0.6, ease: "power3.inOut" }, "<")
      .to(leaf.rotation, { y: 0, duration: 0.7, ease: "power3.out" })
  }

  return {
    /** The open book's meshes, for clicks: clicking it closes it. */
    meshes: [rightPage, leftPage, frontCover, backCover] as THREE.Object3D[],
    get open() {
      return current?.tool ?? null
    },
    show(tool: string | null) {
      const next = tool === null ? null : (books.find((b) => b.tool === tool) ?? null)
      if (next === current) return
      tl?.progress(1).kill()
      const t = gsap.timeline()
      if (current) putBack(current, t)
      if (next) takeOut(next, t)
      current = next
      tl = t
      if (opts.reduce) t.progress(1)
    },
    dispose() {
      tl?.kill()
      left.dispose()
      right.dispose()
    },
  }
}
