import type { Project } from "@/content/site"

export const SCREEN = { w: 1280, h: 760 }
export type ScreenState =
  | { mode: "off" }
  | { mode: "boot" }
  | { mode: "list"; hover: number | null }
  | { mode: "detail"; index: number; image: number; since: number }

/** A project's screenshots, loaded in the browser (cover first, then the gallery). */
export type Shots = HTMLImageElement[]

const ROW = { top: 200, height: 118 }
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
    // The pointed-at project's cover, held on the right behind the list.
    const cover = state.hover !== null ? shots[state.hover]?.[0] : undefined
    if (cover) {
      ctx.save()
      ctx.beginPath()
      ctx.rect(w * 0.56, 0, w * 0.44, h)
      ctx.clip()
      ctx.translate(w * 0.56, 0)
      drawShot(ctx, cover, 0.5, { w: w * 0.44, h }, true)
      ctx.restore()
      ctx.fillStyle = glass
      ctx.globalAlpha = 0.55
      ctx.fillRect(w * 0.56, 0, w * 0.44, h)
      ctx.globalAlpha = 1
    }
    ctx.fillStyle = orange
    ctx.font = `800 60px ${f.display}`
    ctx.fillText("Selected work", 64, 110)
    ctx.fillStyle = soft
    ctx.font = `400 26px ${f.body}`
    ctx.fillText("Click a project to open it", 64, 158)
    projects.forEach((p, i) => {
      const y = ROW.top + i * ROW.height
      if (state.hover === i) {
        ctx.fillStyle = "#1B1E24"
        ctx.fillRect(40, y - 8, w * 0.56 - 60, ROW.height - 10)
      }
      ctx.fillStyle = state.hover === i ? orange : ink
      ctx.font = `600 42px ${f.body}`
      ctx.fillText(p.title, 64, y + 44)
      ctx.fillStyle = soft
      ctx.font = `400 26px ${f.body}`
      ctx.fillText(`${p.year} · ${p.stack.slice(0, 3).join(", ")}`, 64, y + 84)
    })
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

/** What a click at a point on the screen (uv, 0..1 from bottom-left) lands on; `shot` is the screenshot itself. */
export function screenHit(state: ScreenState, uv: { x: number; y: number }, count: number): { row: number } | { back: true } | { shot: true } | null {
  const x = uv.x * SCREEN.w
  const y = (1 - uv.y) * SCREEN.h
  if (state.mode === "list") {
    const row = Math.floor((y - ROW.top + 8) / ROW.height)
    return row >= 0 && row < count && x > 40 && x < SCREEN.w * 0.56 ? { row } : null
  }
  if (state.mode === "detail" && y >= SCREEN.h - BAR) return x <= BACK.w ? { back: true } : null
  return state.mode === "detail" ? { shot: true } : null
}
