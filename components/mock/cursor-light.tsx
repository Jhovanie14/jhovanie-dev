"use client"

import { useEffect, useRef } from "react"

/** A very soft light that follows the mouse across the page background. */
export function CursorLight() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return
    let frame = 0
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        el.style.setProperty("--x", `${e.clientX}px`)
        el.style.setProperty("--y", `${e.clientY}px`)
        el.style.opacity = "1"
      })
    }
    window.addEventListener("pointermove", onMove)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("pointermove", onMove)
    }
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 opacity-0 transition-opacity duration-700"
      style={{
        background:
          "radial-gradient(640px circle at var(--x, 50%) var(--y, 30%), color-mix(in oklch, var(--line-1) 7%, transparent), transparent 75%)",
      }}
    />
  )
}
