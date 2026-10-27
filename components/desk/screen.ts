import { CATEGORIES, type Project } from "@/content/site"

export const SCREEN = { w: 1280, h: 760 }
export type ScreenState =
  | { mode: "off" }
  | { mode: "boot" }
  /**
   * The work, as a file explorer. `hover` is a project's index in the whole list, `folder` is
   * "all" or a category, `slide` animates a page turn and `since` fades in a newly opened folder.
   */
  | { mode: "list"; hover: number | null; folder: string; page: number; slide?: { from: number; since: number }; since?: number }
  | { mode: "detail"; index: number; image: number; since: number }

/** A project's screenshots, loaded in the browser (cover first, then the gallery). */
export type Shots = HTMLImageElement[]

/** Cards per page of a folder; more than this and the folder pages, sliding between them. */
export const PAGE = 6
export const pageCount = (count: number) => Math.max(1, Math.ceil(count / PAGE))
export const SLIDE_TIME = 0.55
export const ALL = "all"

/** The folders in the sidebar: everything, then each category that holds a project. Items are indexes into `projects`. */
export function folders(projects: Project[]) {
  const all = { id: ALL, label: "All projects", items: projects.map((_, i) => i) }
  const byCategory = CATEGORIES.map((c) => ({ id: c as string, label: c as string, items: all.items.filter((i) => projects[i].category === c) }))
  return [all, ...byCategory.filter((f) => f.items.length > 0)]
}
export const folderItems = (projects: Project[], folder: string) => (folders(projects).find((f) => f.id === folder) ?? folders(projects)[0]).items

const TITLE_H = 64
const SIDE = { w: 300, top: 122, row: 60 }
const GRID = { x: 324, top: 92, w: 1280 - 324 - 28, gap: 22, cols: 3, cardH: 268, thumbH: 176 }
const CARD_W = (GRID.w - GRID.gap * (GRID.cols - 1)) / GRID.cols
const PAGER = { top: 680, h: 64, arrow: 150 }
const BAR = 96 // the caption bar along the bottom of the screen in a case study
const BACK = { w: 380 }
/** How long each screenshot plays before the next crossfades in, in seconds. */
export const SHOT_TIME = 6
const FADE = 0.8

type Fonts = { display: string; body: string }
const ink = "#F2EDE6"
const soft = "#8F8A82"
const orange = "#FF7A1A"
const glass = "#0E1014"

const smooth = (t: number) => t * t * (3 - 2 * t)

/** `text` cut with an ellipsis to fit `max` pixels in the current font. */
function clip(ctx: CanvasRenderingContext2D, text: string, max: number) {
  if (ctx.measureText(text).width <= max) return text
  let t = text
  while (t.length > 1 && ctx.measureText(`${t}…`).width > max) t = t.slice(0, -1)
  return `${t.trimEnd()}…`
}

/**
 * One screenshot, moving: a tall page scrolls from top to bottom like someone
 * browsing it; anything wider drifts and zooms slowly. `t` is 0..1 over its turn.
 */
function drawShot(ctx: CanvasRenderingContext2D, img: HTMLImageElement, t: number, area: { w: number; h: number }, still: boolean) {
  const scale = area.w / img.width
  const tall = img.height * scale > area.h * 1.15
  if (tall) {
    const travel = img.height * scale - area.h
    const y = still ? 0 : -travel * smooth(Math.min(1, Math.max(0, (t - 0.12) / 0.76)))
    ctx.drawImage(img, 0, y, area.w, img.height * scale)
    return
  }
  // Cover-fit, then a slow push in with a little drift.
  const cover = Math.max(area.w / img.width, area.h / img.height)
  const zoom = still ? 1 : 1 + 0.08 * t
  const w = img.width * cover * zoom
  const h = img.height * cover * zoom
  const drift = still ? 0 : (t - 0.5) * 40
  ctx.drawImage(img, (area.w - w) / 2 + drift, (area.h - h) / 2, w, h)
}

/** The card for a project at (x, y): its cover, title and the start of its stack. */
function drawCard(ctx: CanvasRenderingContext2D, p: Project, cover: HTMLImageElement | undefined, x: number, y: number, hover: boolean, f: Fonts) {
  ctx.fillStyle = hover ? "#1D2027" : "#16181D"
  ctx.beginPath()
  ctx.roundRect(x, y, CARD_W, GRID.cardH, 14)
  ctx.fill()
  ctx.save()
  ctx.beginPath()
  ctx.roundRect(x, y, CARD_W, GRID.thumbH, [14, 14, 0, 0])
  ctx.clip()
  if (cover) {
    ctx.translate(x, y)
    drawShot(ctx, cover, 0.5, { w: CARD_W, h: GRID.thumbH }, true)
  } else {
    // Before the cover loads (or when there is none): the category on a plain panel.
    ctx.fillStyle = "#1F232A"
    ctx.fillRect(x, y, CARD_W, GRID.thumbH)
    ctx.fillStyle = soft
    ctx.font = `500 20px ${f.body}`
    ctx.fillText(p.category, x + 20, y + GRID.thumbH - 20)
  }
  ctx.restore()
  ctx.fillStyle = hover ? orange : ink
  ctx.font = `600 26px ${f.body}`
  ctx.fillText(clip(ctx, p.title, CARD_W - 36), x + 18, y + GRID.thumbH + 42)
  ctx.fillStyle = soft
  ctx.font = `400 19px ${f.body}`
  // The first tools without their details, trimmed to the card.
  const tools = p.stack.slice(0, 2).map((t) => t.replace(/\s*\(.*\)/, ""))
  ctx.fillText(clip(ctx, `${p.year} · ${tools.join(", ")}`, CARD_W - 36), x + 18, y + GRID.thumbH + 74)
  if (hover) {
    ctx.strokeStyle = orange
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.roundRect(x + 1.5, y + 1.5, CARD_W - 3, GRID.cardH - 3, 13)
    ctx.stroke()
  }
}

/** The work as a file explorer: a title bar, folders down the side, and a page of cards. */
function drawExplorer(
  ctx: CanvasRenderingContext2D,
  state: Extract<ScreenState, { mode: "list" }>,
  projects: Project[],
  f: Fonts,
  shots: (Shots | undefined)[],
  now: number,
  still: boolean
) {
  const { w, h } = SCREEN
  const all = folders(projects)
  const folder = all.find((x) => x.id === state.folder) ?? all[0]
  const pages = pageCount(folder.items.length)

  // Title bar: window dots, where we are, and how much is in it.
  ctx.fillStyle = "#08090B"
  ctx.fillRect(0, 0, w, TITLE_H)
  for (const [n, c] of ["#FF5F57", "#FEBC2E", "#28C840"].entries()) {
    ctx.fillStyle = c
    ctx.beginPath()
    ctx.arc(34 + n * 30, TITLE_H / 2, 9, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.font = `600 24px ${f.body}`
  ctx.fillStyle = soft
  ctx.fillText("Work  /", 150, TITLE_H / 2 + 8)
  ctx.fillStyle = ink
  ctx.fillText(folder.label, 150 + ctx.measureText("Work  /  ").width, TITLE_H / 2 + 8)
  const count = `${folder.items.length} ${folder.items.length === 1 ? "project" : "projects"}`
  ctx.fillStyle = soft
  ctx.font = `400 22px ${f.body}`
  ctx.fillText(count, w - 28 - ctx.measureText(count).width, TITLE_H / 2 + 8)

  // Sidebar: the folders.
  ctx.fillStyle = "#0A0B0E"
  ctx.fillRect(0, TITLE_H, SIDE.w, h - TITLE_H)
  ctx.fillStyle = "#5A5D66"
  ctx.font = `700 17px ${f.body}`
  ctx.fillText("FOLDERS", 30, SIDE.top - 18)
  all.forEach((x, n) => {
    const y = SIDE.top + n * SIDE.row
    const on = x.id === folder.id
    if (on) {
      ctx.fillStyle = "#1B1E24"
      ctx.beginPath()
      ctx.roundRect(14, y, SIDE.w - 28, SIDE.row - 10, 10)
      ctx.fill()
      ctx.fillStyle = orange
      ctx.fillRect(14, y + 12, 4, SIDE.row - 34)
    }
    // A folder glyph: a tab and a body.
    ctx.fillStyle = on ? orange : "#6A6D76"
    ctx.beginPath()
    ctx.roundRect(34, y + 14, 12, 6, 2)
    ctx.roundRect(34, y + 18, 26, 18, 3)
    ctx.fill()
    ctx.fillStyle = on ? ink : "#B4AFA6"
    ctx.font = `${on ? 600 : 500} 22px ${f.body}`
    ctx.fillText(x.label, 74, y + 33)
    ctx.fillStyle = soft
    ctx.font = `400 19px ${f.body}`
    const size = String(x.items.length)
    ctx.fillText(size, SIDE.w - 34 - ctx.measureText(size).width, y + 33)
  })

  // The cards, a page at a time. A page turn slides; a newly opened folder fades in.
  const drawPage = (page: number, dx: number) => {
    folder.items.slice(page * PAGE, page * PAGE + PAGE).forEach((i, k) => {
      const x = GRID.x + (k % GRID.cols) * (CARD_W + GRID.gap) + dx
      const y = GRID.top + Math.floor(k / GRID.cols) * (GRID.cardH + GRID.gap)
      drawCard(ctx, projects[i], shots[i]?.[0], x, y, state.hover === i, f)
    })
  }
  const t = state.slide && !still ? Math.min(1, (now - state.slide.since) / SLIDE_TIME) : 1
  const fade = state.since !== undefined && !still ? Math.min(1, (now - state.since) / 0.35) : 1
  ctx.save()
  ctx.beginPath()
  ctx.rect(GRID.x - 6, GRID.top - 6, GRID.w + 12, PAGER.top - GRID.top)
  ctx.clip()
  ctx.globalAlpha = fade
  if (t < 1 && state.slide) {
    const dir = Math.sign(state.page - state.slide.from)
    const e = 1 - Math.pow(1 - t, 3)
    const span = GRID.w + GRID.gap
    drawPage(state.slide.from, -dir * e * span)
    drawPage(state.page, dir * (1 - e) * span)
  } else drawPage(state.page, 0)
  ctx.restore()

  const y = PAGER.top + PAGER.h / 2 + 8
  if (pages > 1) {
    const right = GRID.x + GRID.w
    ctx.font = `600 24px ${f.body}`
    ctx.fillStyle = state.page > 0 ? orange : "#3A3D44"
    ctx.fillText("←  Prev", GRID.x + 4, y)
    ctx.fillStyle = state.page < pages - 1 ? orange : "#3A3D44"
    const next = "Next  →"
    ctx.fillText(next, right - 4 - ctx.measureText(next).width, y)
    // One dot per page, the current one long.
    const dots = Array.from({ length: pages }, (_, n) => (n === state.page ? 34 : 12))
    let x = GRID.x + GRID.w / 2 - (dots.reduce((a, b) => a + b, 0) + (pages - 1) * 10) / 2
    dots.forEach((dw, n) => {
      ctx.fillStyle = n === state.page ? ink : "#4A4D55"
      ctx.beginPath()
      ctx.roundRect(x, y - 15, dw, 12, 6)
      ctx.fill()
      x += dw + 10
    })
  } else {
    ctx.fillStyle = soft
    ctx.font = `400 22px ${f.body}`
    ctx.fillText("Click a project to open it", GRID.x + 4, y)
  }
}

/** Draw the monitor's screen for its current state. `now` is in seconds. */
export function drawScreen(ctx: CanvasRenderingContext2D, state: ScreenState, projects: Project[], f: Fonts, shots: (Shots | undefined)[] = [], now = 0, still = false) {
  const { w, h } = SCREEN
  ctx.globalAlpha = 1
  ctx.fillStyle = state.mode === "off" ? "#050506" : glass
  ctx.fillRect(0, 0, w, h)
  if (state.mode === "off") return

  if (state.mode === "boot") {
    ctx.fillStyle = soft
    ctx.font = `500 30px ${f.body}`
    ctx.fillText("jhovanie.dev", 64, 110)
    ctx.fillStyle = ink
    ctx.font = `800 64px ${f.display}`
    ctx.fillText("Starting up…", 64, 200)
    return
  }

  if (state.mode === "list") {
    drawExplorer(ctx, state, projects, f, shots, now, still)
    return
  }

  // A case study: the screenshots play above a caption bar.
  const p = projects[state.index]
  const set = shots[state.index] ?? []
  const area = { w, h: h - BAR }
  if (set.length > 0) {
    const elapsed = Math.max(0, now - state.since)
    const turn = shotOnScreen(state, now, still)
    const local = still ? 0.5 : (elapsed % SHOT_TIME) / SHOT_TIME
    const cur = set[turn % set.length]
    ctx.save()
    ctx.beginPath()
    ctx.rect(0, 0, area.w, area.h)
    ctx.clip()
    drawShot(ctx, cur, local, area, still)
    // Crossfade into the next shot over the last moments of this one's turn.
    const fadeStart = 1 - FADE / SHOT_TIME
    if (!still && set.length > 1 && local > fadeStart) {
      ctx.globalAlpha = (local - fadeStart) / (1 - fadeStart)
      drawShot(ctx, set[(turn + 1) % set.length], 0, area, false)
      ctx.globalAlpha = 1
    }
    ctx.restore()
  } else {
    // No screenshots yet: the project's name and a plain note, never a fake interface.
    ctx.fillStyle = ink
    ctx.font = `800 64px ${f.display}`
    ctx.fillText(p.title, 64, 300)
    ctx.fillStyle = soft
    ctx.font = `400 30px ${f.body}`
    ctx.fillText("Screenshots coming soon.", 64, 360)
    ctx.fillStyle = orange
    ctx.font = `500 26px ${f.body}`
    ctx.fillText(p.stack.join(" · "), 64, 420)
  }

  // The caption bar.
  ctx.fillStyle = "#08090B"
  ctx.fillRect(0, h - BAR, w, BAR)
  ctx.fillStyle = orange
  ctx.font = `600 28px ${f.body}`
  ctx.fillText("←  All projects", 40, h - BAR / 2 + 10)
  ctx.fillStyle = ink
  ctx.font = `600 30px ${f.body}`
  ctx.fillText(p.title, BACK.w + 20, h - BAR / 2 + 10)
  if (set.length > 1) {
    const n = shotOnScreen(state, now, still) % set.length
    ctx.fillStyle = soft
    ctx.font = `400 26px ${f.body}`
    const label = `${n + 1} of ${set.length}`
    ctx.fillText(label, w - 40 - ctx.measureText(label).width, h - BAR / 2 + 10)
  }
}

/** Which screenshot a case study is on (not yet wrapped to the number of shots). */
export function shotOnScreen(state: Extract<ScreenState, { mode: "detail" }>, now: number, still = false) {
  return still ? state.image : state.image + Math.floor(Math.max(0, now - state.since) / SHOT_TIME)
}

/**
 * What a click at a point on the screen (uv, 0..1 from bottom-left) lands on: a folder, a project
 * card (its index in the whole list), a page turn, the case study's back link, or its screenshot.
 */
export function screenHit(
  state: ScreenState,
  uv: { x: number; y: number },
  projects: Project[]
): { row: number } | { folder: string } | { page: -1 | 1 } | { back: true } | { shot: true } | null {
  const x = uv.x * SCREEN.w
  const y = (1 - uv.y) * SCREEN.h
  if (state.mode === "list") {
    if (y < TITLE_H) return null
    if (x < SIDE.w) {
      const all = folders(projects)
      const n = Math.floor((y - SIDE.top) / SIDE.row)
      return n >= 0 && n < all.length && y - SIDE.top - n * SIDE.row < SIDE.row - 10 ? { folder: all[n].id } : null
    }
    const items = folderItems(projects, state.folder)
    const pages = pageCount(items.length)
    if (y >= PAGER.top) {
      if (pages < 2) return null
      if (x < GRID.x + PAGER.arrow) return state.page > 0 ? { page: -1 } : null
      if (x > GRID.x + GRID.w - PAGER.arrow) return state.page < pages - 1 ? { page: 1 } : null
      return null
    }
    const col = Math.floor((x - GRID.x) / (CARD_W + GRID.gap))
    const row = Math.floor((y - GRID.top) / (GRID.cardH + GRID.gap))
    const inCard = x - GRID.x - col * (CARD_W + GRID.gap) <= CARD_W && y - GRID.top - row * (GRID.cardH + GRID.gap) <= GRID.cardH
    const i = items[state.page * PAGE + row * GRID.cols + col]
    return col >= 0 && col < GRID.cols && row >= 0 && row < 2 && inCard && i !== undefined ? { row: i } : null
  }
  if (state.mode === "detail" && y >= SCREEN.h - BAR) return x <= BACK.w ? { back: true } : null
  return state.mode === "detail" ? { shot: true } : null
}
