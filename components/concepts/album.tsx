"use client"

import { useRef, useState } from "react"
import Image from "next/image"

import { site } from "@/content/site"
import { gsap, motionOK, useGSAP } from "@/lib/gsap-concepts"
import { cn } from "@/lib/utils"

/*
 * Concept: Album. A ligne claire comic page. One even black line holds every
 * shape; fills are flat, never shaded; daylight blue and sand do the work,
 * and red is saved for the one object the story needs: the call to action.
 * Page one tells who; the corner turns to page two, what and how.
 */

const C = { paper: "#FBFAF6", ink: "#111111", blue: "#6FA8DC", sand: "#E2B15B", red: "#D7301F", sky: "#CFE3F5" }
const LINE = "border-[3px] border-[#111111]"

const lines = [
  site.bio.short,
  `${site.yearsOfExperience} years in, I still read the schema first.`,
  "Laravel on the server, React or Next.js on the screen.",
  "Then I ship it. Docker, Vercel, Cloudflare.",
]

function Balloon({ children, tail = "left", className }: { children: React.ReactNode; tail?: "left" | "right"; className?: string }) {
  return (
    <div className={cn("relative rounded-[1.4rem] bg-white px-4 py-3", LINE, className)}>
      <p className="text-[clamp(1rem,1.35vw,1.2rem)] leading-snug font-bold uppercase">{children}</p>
      <svg aria-hidden viewBox="0 0 30 24" className={cn("absolute -bottom-[21px] h-6 w-8", tail === "left" ? "left-8" : "right-8 -scale-x-100")}>
        <path d="M2 0 L10 22 L24 0" fill="white" stroke="#111111" strokeWidth={3} strokeLinejoin="round" />
        <rect x={0} y={-3} width={28} height={4} fill="white" />
      </svg>
    </div>
  )
}

function Caption({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("w-fit px-3 py-1.5 text-[clamp(0.95rem,1.2vw,1.1rem)] font-bold uppercase", LINE, className)} style={{ background: C.sand }}>
      {children}
    </p>
  )
}

export function Album() {
  const scope = useRef<HTMLDivElement>(null)
  const [line, setLine] = useState(0)
  const [page, setPage] = useState<1 | 2>(1)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(motionOK, () => {
        gsap.from("[data-page='1'] [data-panel]", { opacity: 0, scale: 0.96, duration: 0.5, ease: "expo.out", stagger: 0.12, delay: 0.2 })
      })
      return () => mm.revert()
    },
    { scope }
  )

  // Turning the page: page one swings away on its spine, page two is beneath.
  function turn(to: 1 | 2) {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const sheet = scope.current!.querySelector("[data-sheet]")
    if (reduce) {
      setPage(to)
      return
    }
    if (to === 2) {
      gsap.to(sheet, { rotateY: -180, duration: 1, ease: "power2.inOut", onComplete: () => setPage(2) })
      gsap.from("[data-page='2'] [data-panel]", { opacity: 0, scale: 0.96, duration: 0.5, ease: "expo.out", stagger: 0.1, delay: 0.6 })
    } else {
      setPage(1)
      gsap.fromTo(sheet, { rotateY: -180 }, { rotateY: 0, duration: 1, ease: "power2.inOut" })
    }
  }

  const book = (
    <a
      href={site.bookingUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn("inline-flex h-12 items-center px-5 text-[1.125rem] font-bold text-white uppercase transition-transform duration-150 active:scale-[0.97]", LINE)}
      style={{ background: C.red }}
    >
      {site.cta.book}!
    </a>
  )

  return (
    <div ref={scope} className="min-h-svh pt-11 font-[family-name:var(--font-comic)] selection:bg-[#E2B15B]" style={{ background: C.sky, color: C.ink }}>
      <div className="mx-auto max-w-[84rem] px-3 pt-6 pb-16 sm:px-8 [perspective:2400px]">
        <div className="grid">
          {/* Page two lies beneath; page one is the sheet that turns. */}
          <section data-page="2" aria-labelledby="al-2" aria-hidden={page !== 2} inert={page !== 2} className={cn("col-start-1 row-start-1 p-3 sm:p-5", LINE)} style={{ background: C.paper }}>
            <h2 id="al-2" className="text-[clamp(1.75rem,3.4vw,3rem)] font-bold uppercase">What happens in a project</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {site.process.map((step, i) => (
                <div key={step.title} data-panel className={cn("flex min-h-56 flex-col justify-between gap-4 p-4", LINE)} style={{ background: i % 2 ? C.blue : "white" }}>
                  <Caption>{step.when}</Caption>
                  <Balloon tail={i % 2 ? "right" : "left"}>{step.description}</Balloon>
                  <p className="text-[1.25rem] font-bold uppercase">{step.title}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
              <div data-panel className={cn("p-4", LINE)} style={{ background: C.sand }}>
                <p className="text-[1.25rem] font-bold uppercase">What I can build for you</p>
                <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                  {site.services.map((s) => (
                    <li key={s.title} className="text-[1.0625rem]">
                      <strong>{s.title}.</strong> {s.description}
                    </li>
                  ))}
                </ul>
              </div>
              <div data-panel className={cn("flex flex-col items-start justify-between gap-4 p-4", LINE)} style={{ background: "white" }}>
                <Balloon>To be continued on a call?</Balloon>
                <div className="flex flex-wrap items-center gap-4">
                  {book}
                  <button type="button" onClick={() => turn(1)} className="text-[1.0625rem] font-bold uppercase underline underline-offset-4">
                    ← Back to page one
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Page one. */}
          <section
            data-sheet
            data-page="1"
            aria-labelledby="al-1"
            aria-hidden={page !== 1}
            inert={page !== 1}
            className={cn("relative col-start-1 row-start-1 origin-left p-3 [backface-visibility:hidden] [transform-style:preserve-3d] sm:p-5", LINE, page === 2 && "pointer-events-none")}
            style={{ background: C.paper }}
          >
            <div className="grid h-full gap-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:grid-rows-[minmax(0,1.3fr)_minmax(0,1fr)]">
              <div data-panel className={cn("relative min-h-72 overflow-hidden lg:row-span-2", LINE)} style={{ background: C.sky }}>
                <Image src={site.illustration.src} alt={site.illustration.alt} fill priority sizes="(min-width: 1024px) 55vw, 100vw" className="object-cover object-[60%_35%]" />
                <div className="absolute top-3 left-3 max-w-[85%]">
                  <h1 id="al-1" className={cn("w-fit bg-white px-3 py-2 text-[clamp(1.75rem,4vw,3.75rem)] leading-[0.95] font-bold uppercase", LINE)}>
                    The adventures of {site.name}
                  </h1>
                  <Caption className="mt-2">{site.role}</Caption>
                </div>
              </div>

              <div data-panel className={cn("relative flex min-h-72 items-end justify-between gap-3 overflow-hidden p-4", LINE)} style={{ background: C.blue }}>
                <button
                  type="button"
                  onClick={() => setLine((l) => (l + 1) % lines.length)}
                  aria-label="Next line"
                  className="relative size-40 shrink-0 overflow-hidden border-[3px] border-[#111111] bg-white sm:size-48"
                >
                  <Image src={site.avatar.src} alt={site.avatar.alt} fill sizes="12rem" className="object-cover" />
                </button>
                <Balloon tail="right" className="mb-24 max-w-[16rem]">
                  <span aria-live="polite">{lines[line]}</span>
                </Balloon>
              </div>

              <div data-panel className={cn("flex flex-col justify-between gap-4 p-4", LINE)} style={{ background: C.sand }}>
                <Caption className="bg-white">Meanwhile, in the stack…</Caption>
                <p className="text-[clamp(1.125rem,1.6vw,1.4rem)] leading-snug font-bold uppercase">
                  {site.skills.flatMap((g) => g.items).join(" · ")}
                </p>
                <div className="flex flex-wrap items-center gap-4">
                  {book}
                  <button
                    type="button"
                    onClick={() => turn(2)}
                    className={cn("ml-auto h-12 bg-white px-4 text-[1.0625rem] font-bold uppercase transition-transform duration-150 active:scale-[0.97]", LINE)}
                  >
                    Turn the page →
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
        <p className="mt-4 text-[1rem] font-bold uppercase">Click the portrait to hear more. Turn the page from the corner.</p>
      </div>
    </div>
  )
}
