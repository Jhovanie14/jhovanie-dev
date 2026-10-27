import * as THREE from "three"

/** A canvas drawn once (or redrawn on demand) and used as a texture. */
export function canvasTexture(w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const cv = document.createElement("canvas")
  cv.width = w
  cv.height = h
  draw(cv.getContext("2d")!)
  const tex = new THREE.CanvasTexture(cv)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

/** Redraw an existing canvas texture in place (the monitor's screen). */
export function redraw(tex: THREE.CanvasTexture, draw: (ctx: CanvasRenderingContext2D) => void) {
  const cv = tex.image as HTMLCanvasElement
  draw(cv.getContext("2d")!)
  tex.needsUpdate = true
}

/**
 * Wood: a flat base with long, slightly wavering grain lines in two darker
 * tones. Strokes only, so the surface reads as material, not a gradient.
 */
export function woodTexture(base: string, grain: string, repeat = 1) {
  const tex = canvasTexture(512, 512, (ctx) => {
    ctx.fillStyle = base
    ctx.fillRect(0, 0, 512, 512)
    for (let i = 0; i < 90; i++) {
      const y = Math.random() * 512
      const amp = 2 + Math.random() * 6
      const freq = 0.004 + Math.random() * 0.01
      ctx.strokeStyle = grain
      ctx.globalAlpha = 0.08 + Math.random() * 0.22
      ctx.lineWidth = 0.6 + Math.random() * 2.2
      ctx.beginPath()
      for (let x = 0; x <= 512; x += 8) {
        const yy = y + Math.sin(x * freq + i) * amp
        if (x === 0) ctx.moveTo(x, yy)
        else ctx.lineTo(x, yy)
      }
      ctx.stroke()
    }
    ctx.globalAlpha = 1
  })
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(repeat, repeat)
  return tex
}

/** Painted plaster: a flat colour with faint mottling so walls are not dead flat. */
export function wallTexture(base: string, fleck: string) {
  const tex = canvasTexture(256, 256, (ctx) => {
    ctx.fillStyle = base
    ctx.fillRect(0, 0, 256, 256)
    ctx.fillStyle = fleck
    for (let i = 0; i < 1800; i++) {
      ctx.globalAlpha = Math.random() * 0.05
      ctx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2)
    }
    ctx.globalAlpha = 1
  })
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(4, 3)
  return tex
}

/** Break text into lines that fit `width`, for the screen and the board. */
export function wrap(ctx: CanvasRenderingContext2D, text: string, width: number) {
  const words = text.split(" ")
  const lines: string[] = []
  let line = ""
  for (const w of words) {
    const next = line ? `${line} ${w}` : w
    if (ctx.measureText(next).width > width && line) {
      lines.push(line)
      line = w
    } else line = next
  }
  if (line) lines.push(line)
  return lines
}
