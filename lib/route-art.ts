/**
 * Deterministic transit-map fragments for project placards: the same seed
 * (a project slug) always draws the same route. Coordinates are in a
 * 320 × 200 viewBox; lines run left to right in 45° and flat segments.
 */

type Point = [number, number]

const W = 320
const H = 200

function hash(seed: string) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

// mulberry32: small, fast, good enough for layout.
function random(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function route(rand: () => number, margin = 34): Point[] {
  let x = 18
  let y = margin + rand() * (H - margin * 2)
  const points: Point[] = [[x, y]]

  while (x < W - 40) {
    const dx = 34 + rand() * 30
    const turn = [-1, 0, 0, 1][Math.floor(rand() * 4)]
    let ny = y + turn * dx
    if (ny < margin || ny > H - margin) ny = y
    x = Math.min(x + dx, W - 18)
    y = ny
    points.push([x, y])
  }
  return points
}

const toPath = (points: Point[]) =>
  points.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ")

export function routeArt(seed: string) {
  const rand = random(hash(seed))
  const main = route(rand)
  const others = [route(rand, 20), route(rand, 20)]

  return {
    main: toPath(main),
    stations: main,
    others: others.map(toPath),
  }
}
