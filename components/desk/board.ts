import { yearSpan, type Experience } from "@/content/site"

import { wrap } from "./textures"

/*
 * The experience board on the left wall, drawn on a canvas. With nothing chosen
 * it lists every role; choosing one turns it into a menu, like a game's settings
 * screen: the roles in a column on the left with the chosen one lit, and a card
 * with that role's highlights sliding in on the right.
 */

export const BOARD = { w: 1480, h: 920 }
/** `selected` and `hover` are indexes into the roles; `since` is when the selection last changed, in seconds. */
export type BoardState = { selected: number | null; hover: number | null; since: number }
export const BOARD_TIME = 0.5

type Fonts = { display: string; body: string }
const paper = "#F2EDE6"
const ink = "#15181B"
const grey = "#55555C"
const orange = "#FF7A1A"

const HEAD = 120
/** The full list: roles share the board's height; past three there is only room for the title, company and years. */
const LIST = { top: 230, x: 64, w: 1356 }
const listStep = (n: number) => Math.min(220, 740 / Math.max(1, n))
/** The menu: a column of roles, and the chosen role's card beside it. */
const MENU = { top: 176, x: 40, w: 520, step: (n: number) => Math.min(132, 700 / Math.max(1, n)) }
const CARD = { x: 600, y: 168, w: 840, h: 712 }

const ease = (t: number) => 1 - Math.pow(1 - t, 3)

export function drawBoard(ctx: CanvasRenderingContext2D, state: BoardState, roles: Experience[], f: Fonts, now = 0, still = false) {
  const { w, h } = BOARD
  const t = still ? 1 : ease(Math.min(1, Math.max(0, (now - state.since) / BOARD_TIME)))
  ctx.globalAlpha = 1
  ctx.fillStyle = paper
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = ink
  ctx.font = `800 64px ${f.display}`
  ctx.fillText("Experience", 64, HEAD)
  // The hint sits beside the heading: the board's right edge can fall outside the view.
  const after = 64 + ctx.measureText("Experience").width + 36
  ctx.fillStyle = grey
  ctx.font = `500 28px ${f.body}`
  ctx.fillText(state.selected === null ? "Click a role to open it" : "Click it again to close", after, HEAD - 8)

  if (state.selected === null) {
    ctx.globalAlpha = t
    const step = listStep(roles.length)
    roles.forEach((e, i) => {
      const y = LIST.top + i * step
      if (state.hover === i) {
        ctx.fillStyle = "#E4DCCF"
        ctx.beginPath()
        ctx.roundRect(LIST.x - 24, y - 64, LIST.w + 24, step - 12, 16)
        ctx.fill()
      }
      ctx.fillStyle = orange
      ctx.fillRect(LIST.x, y - 34, 16, 16)
      ctx.fillStyle = state.hover === i ? orange : ink
      ctx.font = `600 48px ${f.body}`
      ctx.fillText(e.title, LIST.x + 36, y)
      ctx.fillStyle = grey
      ctx.font = `400 34px ${f.body}`
      ctx.fillText(`${e.company} · ${yearSpan(e.start, e.end)}`, LIST.x + 36, y + 52)
      wrap(ctx, e.highlights.join(" "), 1300)
        .slice(0, step >= 200 ? 2 : 0)
        .forEach((line, l) => ctx.fillText(line, LIST.x + 36, y + 100 + l * 44))
    })
    ctx.globalAlpha = 1
    return
  }

  // The menu column: every role, the chosen one on an orange bar.
  const step = MENU.step(roles.length)
  roles.forEach((e, i) => {
    const y = MENU.top + i * step
    const on = i === state.selected
    if (on || state.hover === i) {
      ctx.fillStyle = on ? orange : "#E4DCCF"
      ctx.beginPath()
      // The bar sweeps in from the left as the role is chosen.
      ctx.roundRect(MENU.x, y, (on ? t : 1) * MENU.w, step - 14, 14)
      ctx.fill()
    }
    ctx.fillStyle = on ? ink : state.hover === i ? orange : ink
    ctx.font = `${on ? 700 : 600} 34px ${f.body}`
    ctx.fillText(e.title, MENU.x + 28, y + step / 2 - 6)
    ctx.fillStyle = on ? ink : grey
    ctx.font = `400 25px ${f.body}`
    ctx.fillText(`${e.company} · ${yearSpan(e.start, e.end)}`, MENU.x + 28, y + step / 2 + 30)
    if (on) {
      ctx.font = `700 34px ${f.body}`
      ctx.fillText("›", MENU.x + MENU.w - 44, y + step / 2 + 10)
    }
  })

  // The card: slides in from the right and fades up.
  const role = roles[state.selected]
  const x = CARD.x + (1 - t) * 90
  ctx.globalAlpha = t
  ctx.fillStyle = ink
  ctx.beginPath()
  ctx.roundRect(x, CARD.y, CARD.w, CARD.h, 22)
  ctx.fill()
  const pad = 52
  ctx.fillStyle = paper
  // Long company names step down in size to fit the card.
  let size = 50
  do ctx.font = `800 ${size}px ${f.display}`
  while (ctx.measureText(role.company).width > CARD.w - pad * 2 && (size -= 2) > 28)
  ctx.fillText(role.company, x + pad, CARD.y + 92)
  ctx.fillStyle = orange
  ctx.font = `600 32px ${f.body}`
  ctx.fillText(role.title, x + pad, CARD.y + 144)
  ctx.fillStyle = "#A39D94"
  ctx.font = `400 27px ${f.body}`
  ctx.fillText(yearSpan(role.start, role.end), x + pad, CARD.y + 186)
  ctx.fillStyle = "#2E3138"
  ctx.fillRect(x + pad, CARD.y + 214, CARD.w - pad * 2, 2)

  // Highlights, as many lines as fit above the stack.
  const chipsTop = CARD.y + CARD.h - (role.stack.length ? 96 : 40)
  let y = CARD.y + 268
  ctx.font = `400 29px ${f.body}`
  for (const point of role.highlights) {
    const lines = wrap(ctx, point, CARD.w - pad * 2 - 34)
    if (y + (lines.length - 1) * 40 > chipsTop - 20) break
    ctx.fillStyle = orange
    ctx.fillRect(x + pad, y - 18, 12, 12)
    ctx.fillStyle = paper
    lines.forEach((line, l) => ctx.fillText(line, x + pad + 34, y + l * 40))
    y += lines.length * 40 + 22
  }

  // The stack, as chips along the bottom.
  let cx = x + pad
  ctx.font = `500 23px ${f.body}`
  for (const tool of role.stack) {
    const cw = ctx.measureText(tool).width + 36
    if (cx + cw > x + CARD.w - pad) break
    ctx.fillStyle = "#262A31"
    ctx.beginPath()
    ctx.roundRect(cx, chipsTop, cw, 46, 23)
    ctx.fill()
    ctx.fillStyle = paper
    ctx.fillText(tool, cx + 18, chipsTop + 31)
    cx += cw + 12
  }
  ctx.globalAlpha = 1
}

/** Which role a point on the board (uv, 0..1 from bottom-left) lands on. */
export function boardHit(state: BoardState, uv: { x: number; y: number }, count: number): number | null {
  const x = uv.x * BOARD.w
  const y = (1 - uv.y) * BOARD.h
  if (state.selected === null) {
    const step = listStep(count)
    const i = Math.floor((y - (LIST.top - 64)) / step)
    return x > LIST.x - 24 && x < LIST.x + LIST.w && i >= 0 && i < count ? i : null
  }
  const step = MENU.step(count)
  const i = Math.floor((y - MENU.top) / step)
  return x > MENU.x && x < MENU.x + MENU.w && i >= 0 && i < count ? i : null
}
