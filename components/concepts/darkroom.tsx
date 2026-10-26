"use client"

import { useEffect, useRef, useState } from "react"

import { site } from "@/content/site"
import { gsap, motionOK, useGSAP } from "@/lib/gsap-concepts"
import { cn } from "@/lib/utils"

/*
 * Concept: Darkroom. Safelight red. The picture lies in the tray undeveloped;
 * wherever the pointer moves, it develops, and stays developed. The work
 * hangs below as prints on a contact sheet; pick one to enlarge it.
 * Red-black room, one safelight red, print-white paper.
 */

const C = { room: "#1A0505", light: "#D7261E", paper: "#F3EEE8", text: "#F3E4DF", soft: "#C9A29B", ink: "#1A1312" }

const prints = [
  { id: "work", title: "What I build", body: site.services.map((s) => `${s.title}: ${s.description}`) },
  { id: "stack", title: "Stack", body: site.skills.map((g) => `${g.group}: ${g.items.join(", ")}`) },
  { id: "roles", title: "Roles", body: site.experience.map((e) => `${e.title}, ${e.company}`) },
  { id: "process", title: "How it runs", body: site.process.map((p) => `${p.when}: ${p.title}`) },
]

export function Darkroom() {
  const scope = useRef<HTMLDivElement>(null)
  const tray = useRef<HTMLCanvasElement>(null)
  const [open, setOpen] = useState<string | null>(null)
  const [developed, setDeveloped] = useState(false)

  // The developer: every stroke adds a little of the real picture, permanently.
  useEffect(() => {
    const canvas = tray.current!
    const ctx = canvas.getContext("2d")!
    const img = new Image()
    img.src = site.illustration.src
    let ready = false
    const fit = () => {
      canvas.width = canvas.clientWidth * devicePixelRatio
      canvas.height = canvas.clientHeight * devicePixelRatio
    }
    const develop = (x: number, y: number, r: number, amount: number) => {
      if (!ready) return
      ctx.save()
      ctx.globalAlpha = amount
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.clip()
      // Cover-fit the picture into the tray.
      const s = Math.max(canvas.width / img.width, canvas.height / img.height)
      const w = img.width * s
      const h = img.height * s
      ctx.drawImage(img, (canvas.width - w) / 2, (canvas.height - h) * 0.4, w, h)
      ctx.restore()
    }
    img.onload = () => {
      ready = true
      fit()
      if (!window.matchMedia(motionOK).matches) {
        develop(canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height), 1)
        return
      }
      // A first patch develops on its own, so the idea is obvious.
      const spot = { r: 0 }
      gsap.to(spot, {
        r: canvas.height * 0.38,
        duration: 2.4,
        ease: "power2.out",
        delay: 0.6,
        onUpdate: () => develop(canvas.width * 0.62, canvas.height * 0.42, spot.r, 0.08),
      })
    }
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      const x = (e.clientX - r.left) * devicePixelRatio
      const y = (e.clientY - r.top) * devicePixelRatio
      develop(x, y, 70 * devicePixelRatio, 0.1)
      setDeveloped(true)
    }
    canvas.addEventListener("pointermove", onMove)
    return () => canvas.removeEventListener("pointermove", onMove)
  }, [])

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(motionOK, () => {
        gsap.from("[data-dr-title] > *", { y: 20, opacity: 0, duration: 0.9, ease: "expo.out", stagger: 0.1, delay: 0.2 })
        gsap.from("[data-print]", {
          y: 40,
          rotation: (i) => (i % 2 ? 3 : -3),
          opacity: 0,
          duration: 0.8,
          ease: "expo.out",
          stagger: 0.1,
          scrollTrigger: { trigger: "[data-sheet]", start: "top 85%", once: true },
        })
      })
      return () => mm.revert()
    },
    { scope }
  )

  return (
    <div ref={scope} className="min-h-svh pt-11 font-[family-name:var(--font-work)] selection:bg-[#D7261E] selection:text-white" style={{ background: C.room, color: C.text }}>
      <div className="mx-auto max-w-[90rem] px-5 pt-8 pb-24 sm:px-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)] lg:items-end">
          <header data-dr-title>
            <h1 className="font-[family-name:var(--font-gloock)] text-[clamp(3rem,6.5vw,6rem)] leading-[0.95]">{site.name}</h1>
            <p className="mt-4 max-w-[36ch] text-[clamp(1.0625rem,1.4vw,1.25rem)]">
              {site.role}. Move over the print to develop it. {site.bio.short}
            </p>
            <a
              href={site.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex h-12 items-center px-6 font-semibold text-white transition-transform duration-150 active:scale-[0.97]"
              style={{ background: C.light }}
            >
              {site.cta.book}
            </a>
          </header>

          {/* The tray: the undeveloped paper beneath, the developing picture above. */}
          <figure className="relative">
            <div className="relative aspect-[4/3] overflow-hidden" style={{ background: C.paper }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- the faint latent image under the canvas */}
              <img src={site.illustration.src} alt="" aria-hidden className="absolute inset-0 size-full object-cover object-[50%_40%] opacity-[0.12] grayscale" />
              <canvas ref={tray} role="img" aria-label={site.illustration.alt} className="absolute inset-0 size-full cursor-crosshair touch-none" />
            </div>
            <figcaption className="mt-2 text-[14px]" style={{ color: C.soft }}>
              {developed ? "Developing. It stays where you have been." : "Undeveloped print. Move over it."}
            </figcaption>
          </figure>
        </div>

        {/* The contact sheet. */}
        <section data-sheet aria-labelledby="dr-sheet" className="mt-28">
          <h2 id="dr-sheet" className="font-[family-name:var(--font-gloock)] text-[clamp(2rem,3.6vw,3.25rem)]">
            Contact sheet
          </h2>
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {prints.map((p, i) => {
              const isOpen = open === p.id
              return (
                <li key={p.id} data-print className={cn(isOpen && "sm:col-span-2")}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : p.id)}
                    className="block w-full p-3 pb-4 text-left transition-transform duration-300 ease-out hover:-translate-y-1"
                    style={{ background: C.paper, color: C.ink }}
                  >
                    <span className="flex justify-between text-[13px] font-semibold tabular-nums" style={{ color: C.light }}>
                      <span>{i * 2 + 12}</span>
                      <span>{i * 2 + 12}A</span>
                    </span>
                    <span className="mt-2 block font-[family-name:var(--font-gloock)] text-[1.75rem] leading-tight">{p.title}</span>
                    <span className={cn("mt-2 block text-[16px] leading-snug", !isOpen && "line-clamp-3")}>{p.body.join(" · ")}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      </div>
    </div>
  )
}
