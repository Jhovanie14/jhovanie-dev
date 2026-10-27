"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import { IconChevronLeft, IconChevronRight, IconX } from "@tabler/icons-react"

import { gsap } from "@/lib/gsap"
import { cn } from "@/lib/utils"

import type { ShotPaths } from "./desk-site"

/*
 * A case study's screenshots at full size, over everything. It opens out of the
 * thumbnail that was tapped and closes back into the one for the shot it ends
 * on. Swipe (or the arrows) between shots; tall phone screens scroll; swipe
 * down, Back, Escape or the cross to leave.
 */

type Props = {
  title: string
  shots: ShotPaths
  /** The open shot, or null when closed. */
  index: number | null
  onIndex: (k: number) => void
  onClose: (k: number) => void
  /** The thumbnail a shot opens from and closes into. */
  origin: (k: number) => HTMLElement | null
}

const tallShot = (s: ShotPaths[number]) => s.height / s.width > 1.3
const UNCLIPPED = "inset(0% 0% 0% 0% round 0px)"

/** The transform that lays `img` over `thumb`, cropped the way the thumbnail crops it (cover, from the top). */
function overThumb(img: HTMLElement, thumb: HTMLElement) {
  const t = img.getBoundingClientRect()
  const o = thumb.getBoundingClientRect()
  const scale = Math.max(o.width / t.width, o.height / t.height)
  const side = ((1 - o.width / (t.width * scale)) / 2) * 100
  const bottom = (1 - o.height / (t.height * scale)) * 100
  return {
    x: o.left - t.left - (side / 100) * t.width * scale,
    y: o.top - t.top,
    scale,
    clipPath: `inset(0% ${side}% ${bottom}% ${side}% round ${6 / scale}px)`,
  }
}

export function ShotViewer({ title, shots, index, onIndex, onClose, origin }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const shade = useRef<HTMLDivElement>(null)
  const chrome = useRef<HTMLDivElement>(null)
  const at = useRef(0)
  const closing = useRef(false)
  const open = index !== null

  const reduce = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches
  const slide = (k: number) => track.current?.children[k] as HTMLElement | undefined
  const image = (k: number) => slide(k)?.querySelector<HTMLElement>("[data-img]") ?? null

  // Animate out, then hand the shot it ended on back to the page.
  const finish = () => {
    if (closing.current) return
    closing.current = true
    const k = at.current
    const img = image(k)
    const thumb = origin(k)
    const done = () => {
      dialog.current?.close()
      gsap.set([img, shade.current, chrome.current], { clearProps: "all" })
      closing.current = false
      onClose(k)
    }
    if (reduce() || !img) return done()
    const visible = thumb && thumb.getBoundingClientRect().width > 0
    gsap.to(chrome.current, { opacity: 0, duration: 0.15 })
    gsap.to(shade.current, { opacity: 0, duration: 0.4, ease: "power2.in" })
    gsap.set(img, { clipPath: UNCLIPPED })
    gsap.to(img, {
      ...(visible ? overThumb(img, thumb) : { scale: 0.85, opacity: 0 }),
      duration: 0.45,
      ease: "expo.inOut",
      transformOrigin: "0 0",
      onComplete: done,
    })
  }
  // Leaving goes through history, so the phone's Back button and the cross take the same path.
  const close = () => (history.state?.shotViewer ? history.back() : finish())

  const goTo = (k: number) => {
    const el = track.current
    if (!el) return
    const n = Math.max(0, Math.min(shots.length - 1, k))
    el.scrollTo({ left: n * el.clientWidth, behavior: reduce() ? "auto" : "smooth" })
  }

  // Opening: show the dialog on the right shot, then grow it out of its thumbnail.
  useEffect(() => {
    const d = dialog.current
    const el = track.current
    if (index === null || !d || !el || d.open) return
    d.showModal()
    at.current = index
    el.scrollLeft = index * el.clientWidth
    history.pushState({ ...history.state, shotViewer: true }, "")
    const root = document.documentElement
    const overflow = root.style.overflow
    root.style.overflow = "hidden"

    const img = image(index)
    const thumb = origin(index)
    if (!reduce() && img) {
      const tl = gsap.timeline()
      tl.from(shade.current, { opacity: 0, duration: 0.35, ease: "power2.out" })
      if (thumb) {
        tl.fromTo(img, { ...overThumb(img, thumb), transformOrigin: "0 0" }, { x: 0, y: 0, scale: 1, clipPath: UNCLIPPED, duration: 0.6, ease: "expo.out", clearProps: "all" }, 0)
      }
      else tl.from(img, { scale: 0.9, opacity: 0, duration: 0.5, ease: "expo.out", clearProps: "all" }, 0)
      tl.from(chrome.current, { opacity: 0, y: -8, duration: 0.3, clearProps: "all" }, 0.25)
    }

    const onPop = () => finish()
    window.addEventListener("popstate", onPop)
    return () => {
      window.removeEventListener("popstate", onPop)
      root.style.overflow = overflow
    }
    // Runs on open only; the shot changes as the visitor swipes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  // Swipe down from the top of a shot to close it.
  const pull = useRef<{ x: number; y: number; dy: number; armed: boolean } | null>(null)
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]
    pull.current = { x: t.clientX, y: t.clientY, dy: 0, armed: (slide(at.current)?.scrollTop ?? 0) <= 0 && e.touches.length === 1 }
  }
  const onTouchMove = (e: React.TouchEvent) => {
    const p = pull.current
    if (!p?.armed) return
    const t = e.touches[0]
    const dy = t.clientY - p.y
    if (dy <= 0 || Math.abs(t.clientX - p.x) > dy) {
      p.dy = 0
      return
    }
    p.dy = dy
    gsap.set(image(at.current), { y: dy * 0.6, scale: 1 - Math.min(dy, 300) / 1500 })
    gsap.set(shade.current, { opacity: 1 - Math.min(dy, 300) / 450 })
  }
  const onTouchEnd = () => {
    const p = pull.current
    pull.current = null
    if (!p?.dy) return
    if (p.dy > 110) return close()
    gsap.to(image(at.current), { y: 0, scale: 1, duration: 0.35, ease: "expo.out", clearProps: "all" })
    gsap.to(shade.current, { opacity: 1, duration: 0.35, clearProps: "all" })
  }

  const k = index ?? 0
  const current = shots[k]

  return (
    <dialog
      ref={dialog}
      aria-label={`${title}: screenshots`}
      onCancel={(e) => {
        e.preventDefault()
        close()
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") goTo(at.current + 1)
        if (e.key === "ArrowLeft") goTo(at.current - 1)
      }}
      className="fixed inset-0 m-0 size-full max-h-none max-w-none overflow-hidden bg-transparent p-0 text-foreground backdrop:bg-transparent"
    >
      <div ref={shade} className="absolute inset-0 bg-background" />

      <div
        ref={track}
        onScroll={(e) => {
          const el = e.currentTarget
          const n = Math.round(el.scrollLeft / el.clientWidth)
          if (n !== at.current && n >= 0 && n < shots.length) {
            at.current = n
            onIndex(n)
          }
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        className="relative flex h-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {shots.map((s, n) => {
          const tall = tallShot(s)
          return (
            <figure key={s.src} aria-hidden={n !== k} className="h-full w-full shrink-0 snap-center snap-always overflow-y-auto overscroll-contain">
              <div className={cn("flex min-h-full justify-center px-4 pt-20 pb-28 sm:px-10", !tall && "items-center")}>
                <Image
                  data-img
                  src={s.src}
                  alt={s.alt}
                  width={s.width}
                  height={s.height}
                  sizes={tall ? "(min-width: 640px) 30rem, 100vw" : "100vw"}
                  className={cn("rounded-md", tall ? "h-auto w-full max-w-[30rem]" : "h-auto max-h-[calc(100dvh-12rem)] w-auto max-w-full object-contain")}
                />
              </div>
            </figure>
          )
        })}
      </div>

      <div ref={chrome}>
        <div className="absolute inset-x-0 top-0 flex h-16 items-center justify-between gap-4 bg-background px-4 sm:px-10">
          <p className="min-w-0 truncate font-heading text-[15px] font-extrabold">{title}</p>
          <div className="flex items-center gap-3">
            {shots.length > 1 && (
              <p aria-live="polite" className="text-[14px] text-muted-foreground tabular-nums">
                {k + 1} of {shots.length}
              </p>
            )}
            <button
              type="button"
              onClick={close}
              aria-label="Close screenshots"
              className="grid size-11 place-items-center rounded-full bg-foreground text-background transition-transform duration-150 active:scale-95"
            >
              <IconX aria-hidden stroke={2} className="size-5" />
            </button>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 px-4 pb-6 sm:px-10">
          <p className="max-w-[60ch] rounded-lg bg-card px-4 py-2.5 text-[15px] text-pretty">{current?.alt}</p>
          {shots.length > 1 && (
            <div className="pointer-events-auto hidden shrink-0 gap-2 sm:flex">
              {[
                { label: "Previous screenshot", to: k - 1, icon: IconChevronLeft },
                { label: "Next screenshot", to: k + 1, icon: IconChevronRight },
              ].map(({ label, to, icon: Icon }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => goTo(to)}
                  disabled={to < 0 || to >= shots.length}
                  aria-label={label}
                  className="grid size-11 place-items-center rounded-full bg-card transition-[background-color,opacity] duration-150 hover:bg-popover disabled:opacity-35"
                >
                  <Icon aria-hidden stroke={2} className="size-5" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </dialog>
  )
}
