"use client"

import { useEffect, useRef, useState } from "react"

import { site } from "@/content/site"
import { Draggable, gsap, motionOK } from "@/lib/gsap-concepts"
import { cn } from "@/lib/utils"

/*
 * Concept: Scope. A phosphor oscilloscope on a signal bench. Each channel
 * carries one part of the story with its own waveform. The trace rolls until
 * the trigger is set; then it stands still and the readout prints the channel.
 * Bench black, phosphor green trace on an etched graticule, amber readouts.
 */

const C = { bench: "#1B1D1B", glass: "#0A0F0B", trace: "#5CFF8F", grid: "#2C372F", amber: "#FFB547", label: "#D8DDD5", soft: "#8C968D" }

type Channel = { id: string; name: string; wave: (x: number) => number; lines: string[] }

const channels: Channel[] = [
  { id: "CH1", name: "Services", wave: (x) => Math.sin(x), lines: site.services.map((s) => `${s.title} · ${s.stack.slice(0, 3).join(", ")}`) },
  { id: "CH2", name: "Stack", wave: (x) => (Math.sin(x) >= 0 ? 0.8 : -0.8), lines: site.skills.map((g) => `${g.group} · ${g.items.join(", ")}`) },
  { id: "CH3", name: "Experience", wave: (x) => ((((x / Math.PI) % 2) + 2) % 2) - 1, lines: site.experience.map((e) => `${e.title} · ${e.company} · ${e.start.slice(0, 4)}–${e.end === "present" ? "now" : e.end.slice(0, 4)}`) },
]

const TRIGGER_LOCK = 25 // degrees either side of top dead centre

function Knob({ label, value, onTurn, min = -150, max = 150 }: { label: string; value: number; onTurn: (deg: number) => void; min?: number; max?: number }) {
  const el = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const [d] = Draggable.create(el.current, {
      type: "rotation",
      bounds: { minRotation: min, maxRotation: max },
      onDrag() {
        onTurn(this.rotation)
      },
    })
    return () => {
      d.kill()
    }
  }, [min, max, onTurn])
  useEffect(() => {
    gsap.set(el.current, { rotation: value })
    Draggable.get(el.current)?.update()
  }, [value])
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        ref={el}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={Math.round(value)}
        onKeyDown={(e) => {
          const step = e.key === "ArrowRight" || e.key === "ArrowUp" ? 10 : e.key === "ArrowLeft" || e.key === "ArrowDown" ? -10 : 0
          if (!step) return
          e.preventDefault()
          onTurn(Math.max(min, Math.min(max, value + step)))
        }}
        className="relative size-16 cursor-grab rounded-full border-2 bg-[#2A2D2A] active:cursor-grabbing sm:size-20"
        style={{ borderColor: "#444944" }}
      >
        <span aria-hidden className="absolute top-1.5 left-1/2 h-4 w-1 -translate-x-1/2 rounded-full" style={{ background: C.label }} />
      </div>
      <span className="text-[13px] font-semibold tracking-[0.08em] uppercase" style={{ color: C.soft }}>
        {label}
      </span>
    </div>
  )
}

export function Scope() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [ch, setCh] = useState(0)
  const [timebase, setTimebase] = useState(-40)
  const [trigger, setTrigger] = useState(110)
  const locked = Math.abs(trigger) <= TRIGGER_LOCK
  const state = useRef({ ch, timebase, locked, phase: 0 })
  useEffect(() => {
    state.current.ch = ch
    state.current.timebase = timebase
    state.current.locked = locked
  }, [ch, timebase, locked])

  // The trace: drawn every frame; it rolls until the trigger holds it.
  useEffect(() => {
    const el = canvas.current!
    const ctx = el.getContext("2d")!
    const motion = window.matchMedia(motionOK).matches
    const draw = () => {
      const w = (el.width = el.clientWidth * devicePixelRatio)
      const h = (el.height = el.clientHeight * devicePixelRatio)
      ctx.fillStyle = C.glass
      ctx.fillRect(0, 0, w, h)
      // Graticule: 10 by 8 divisions with minor ticks on the centre lines.
      ctx.strokeStyle = C.grid
      ctx.lineWidth = devicePixelRatio
      for (let i = 0; i <= 10; i++) {
        ctx.beginPath()
        ctx.moveTo((w * i) / 10, 0)
        ctx.lineTo((w * i) / 10, h)
        ctx.stroke()
      }
      for (let j = 0; j <= 8; j++) {
        ctx.beginPath()
        ctx.moveTo(0, (h * j) / 8)
        ctx.lineTo(w, (h * j) / 8)
        ctx.stroke()
      }
      const s = state.current
      if (!s.locked && motion) s.phase += 0.06
      const freq = 2 + ((s.timebase + 150) / 300) * 8
      const wave = channels[s.ch].wave
      ctx.strokeStyle = C.trace
      ctx.lineWidth = 2.5 * devicePixelRatio
      ctx.beginPath()
      for (let x = 0; x <= w; x += 2) {
        const t = (x / w) * Math.PI * freq + s.phase
        const noise = s.locked ? 0 : (Math.random() - 0.5) * 0.06
        const y = h / 2 - (wave(t) + noise) * h * 0.32
        if (x === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
    }
    draw()
    if (!motion) return
    gsap.ticker.add(draw)
    return () => gsap.ticker.remove(draw)
  }, [])

  const channel = channels[ch]

  return (
    <div className="min-h-svh pt-11 font-[family-name:var(--font-chakra)] selection:bg-[#5CFF8F] selection:text-black" style={{ background: C.bench, color: C.label }}>
      <div className="mx-auto max-w-[90rem] px-5 pt-8 pb-16 sm:px-10">
        <header className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="text-[clamp(2.5rem,6vw,5.25rem)] leading-[0.92] font-bold tracking-[-0.01em] uppercase">{site.name}</h1>
            <p className="mt-3 max-w-[50ch] text-[clamp(1.0625rem,1.4vw,1.25rem)]">
              {site.role}. Pick a channel, then turn the trigger until the trace locks.
            </p>
          </div>
          <a
            href={site.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center rounded-md px-6 font-bold tracking-[0.04em] uppercase transition-transform duration-150 active:scale-[0.97]"
            style={{ background: C.amber, color: "#1B1D1B" }}
          >
            {site.cta.book}
          </a>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          {/* The screen. */}
          <div className="rounded-xl p-3 sm:p-4" style={{ background: "#262926" }}>
            <canvas ref={canvas} role="img" aria-label={`${channel.id} ${channel.name} trace, ${locked ? "locked" : "rolling"}`} className="aspect-[5/4] w-full rounded-md sm:aspect-[5/3]" />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[14px] tabular-nums" style={{ color: C.amber }}>
              <span>
                {channel.id} · {channel.name}
              </span>
              <span>TB {(2 + ((timebase + 150) / 300) * 8).toFixed(1)} div</span>
              <span aria-live="polite">{locked ? "TRIG'D" : "TRIG?"}</span>
            </div>
          </div>

          {/* The bench: channel select, knobs, readout. */}
          <div className="flex flex-col gap-6">
            <div role="radiogroup" aria-label="Channel" className="grid grid-cols-3 gap-2">
              {channels.map((c, i) => (
                <button
                  key={c.id}
                  role="radio"
                  aria-checked={ch === i}
                  onClick={() => setCh(i)}
                  className={cn("h-14 rounded-md text-[14px] font-semibold uppercase transition-colors duration-150", ch === i ? "text-black" : "hover:bg-[#333733]")}
                  style={{ background: ch === i ? C.trace : "#2A2D2A" }}
                >
                  {c.id}
                  <span className="block text-[12px] font-medium normal-case">{c.name}</span>
                </button>
              ))}
            </div>
            <div className="flex justify-around">
              <Knob label="Timebase" value={timebase} onTurn={setTimebase} />
              <Knob label="Trigger" value={trigger} onTurn={setTrigger} />
            </div>
            <div aria-live="polite" className="min-h-48 rounded-md p-4 text-[15px] leading-relaxed" style={{ background: C.glass }}>
              {locked ? (
                <ul style={{ color: C.trace }}>
                  {channel.lines.map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: C.soft }}>No trigger. Turn the trigger knob toward the top until the trace stands still.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
