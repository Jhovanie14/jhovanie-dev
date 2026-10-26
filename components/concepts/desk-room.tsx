"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import * as THREE from "three"
import { IconArrowDown, IconCheck, IconCopy } from "@tabler/icons-react"

import { site } from "@/content/site"
import { ScrollTrigger } from "@/lib/gsap-concepts"

/*
 * Prototype: 3D desk. Jhovanie's desk as a small room in real-time 3D. Drag to
 * look around; scrolling flies the camera to the monitor (projects), the shelf
 * (skills, one per book spine), the wall board (experience) and a note on the
 * desk (contact). Objects answer the pointer; the lamp switches on and off.
 * Dark room, warm lamp light, orange from the portrait's shirt.
 */

const C = { room: "#0D0D10", text: "#F2EDE6", soft: "#A39D94", orange: "#FF7A1A", panel: "#151518" }
const SECTIONS = ["intro", "projects", "skills", "experience", "contact"] as const
type Section = (typeof SECTIONS)[number]

// Camera stops: where the camera stands and what it looks at, per section.
const STOPS: Record<Section, { pos: [number, number, number]; look: [number, number, number] }> = {
  intro: { pos: [3.4, 2.3, 3.8], look: [-0.2, 1.05, -0.2] },
  projects: { pos: [0.05, 1.28, 1.15], look: [0.05, 1.18, -0.3] },
  skills: { pos: [-0.15, 2.05, 1.05], look: [-0.15, 2.05, -0.95] },
  experience: { pos: [-0.2, 1.6, 0.35], look: [-1.9, 1.6, 0.35] },
  contact: { pos: [1.35, 1.25, 1.05], look: [0.75, 0.93, 0.15] },
}

/** A canvas drawn once and used as a texture: screens, spines, the board, the note. */
function canvasTexture(w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const cv = document.createElement("canvas")
  cv.width = w
  cv.height = h
  draw(cv.getContext("2d")!)
  const tex = new THREE.CanvasTexture(cv)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

function box(w: number, h: number, d: number, color: string, opts: Partial<THREE.MeshStandardMaterialParameters> = {}) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color, roughness: 0.8, ...opts }))
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

export function DeskRoom({ displayFamily, bodyFamily, cv }: { displayFamily: string; bodyFamily: string; cv: string | null }) {
  const mount = useRef<HTMLDivElement>(null)
  const page = useRef<HTMLDivElement>(null)
  const [fallback, setFallback] = useState(false)
  const [copied, setCopied] = useState(false)
  const [hint, setHint] = useState<string | null>(null)

  useEffect(() => {
    const el = mount.current!
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" })
    } catch {
      queueMicrotask(() => setFallback(true))
      return
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const small = window.matchMedia("(max-width: 767px)").matches
    renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.5 : 2))
    renderer.shadowMap.enabled = !small
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.05
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(C.room)
    const camera = new THREE.PerspectiveCamera(40, 1, 0.05, 40)

    // Light: a low ambient fill, the lamp, and the monitor's own light on the desk.
    scene.add(new THREE.HemisphereLight("#9fb3ff", "#2a1c12", 0.35))
    const lamp = new THREE.PointLight("#FFB070", 9, 6, 1.6)
    lamp.position.set(0.95, 1.55, -0.1)
    lamp.castShadow = !small
    lamp.shadow.mapSize.set(1024, 1024)
    scene.add(lamp)
    const screenLight = new THREE.RectAreaLight("#8fb4ff", 0, 1, 0.6)

    // The room: floor, back wall, left wall (cut away on the viewer's side).
    const floor = box(6, 0.05, 5, "#2A2420")
    floor.position.set(0, -0.025, 0.5)
    const back = box(6, 3.2, 0.05, "#26262C")
    back.position.set(0, 1.6, -1.0)
    const left = box(0.05, 3.2, 5, "#222228")
    left.position.set(-2.0, 1.6, 0.5)
    scene.add(floor, back, left)

    // The desk.
    const wood = "#6B4430"
    const top = box(2.4, 0.07, 1.0, wood)
    top.position.set(0, 0.75, -0.35)
    scene.add(top)
    for (const [x, z] of [[-1.12, -0.78], [1.12, -0.78], [-1.12, 0.08], [1.12, 0.08]]) {
      const leg = box(0.06, 0.72, 0.06, "#2C2C30")
      leg.position.set(x, 0.36, z)
      scene.add(leg)
    }

    const fonts = Promise.all([document.fonts.load(`800 60px ${displayFamily}`), document.fonts.load(`500 30px ${bodyFamily}`)])
    const interactive: { mesh: THREE.Object3D; section: Section | "lamp"; label: string }[] = []

    // The monitor: its screen shows the work.
    const monitor = new THREE.Group()
    const stand = box(0.08, 0.32, 0.08, "#1C1C20")
    stand.position.set(0, 0.95, -0.55)
    const bezel = box(1.14, 0.7, 0.05, "#141418")
    bezel.position.set(0, 1.28, -0.58)
    monitor.add(stand, bezel)
    const screenMat = new THREE.MeshBasicMaterial({ color: "#ffffff" })
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.06, 0.62), screenMat)
    screen.position.set(0, 1.28, -0.554)
    monitor.add(screen)
    screenLight.position.set(0, 1.28, -0.5)
    screenLight.lookAt(0, 0.75, 0.4)
    scene.add(monitor, screenLight)
    interactive.push({ mesh: bezel, section: "projects", label: "Monitor: selected work" })
    interactive.push({ mesh: screen, section: "projects", label: "Monitor: selected work" })

    const keyboard = box(0.62, 0.025, 0.2, "#1E1E22")
    keyboard.position.set(-0.05, 0.8, -0.1)
    const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.045, 0.11, 24), new THREE.MeshStandardMaterial({ color: C.orange, roughness: 0.5 }))
    mug.position.set(0.52, 0.84, -0.12)
    mug.castShadow = true
    scene.add(keyboard, mug)

    // The lamp: click it to switch it.
    const lampGroup = new THREE.Group()
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.03, 24), new THREE.MeshStandardMaterial({ color: "#2B2B30" }))
    base.position.set(0.95, 0.8, -0.55)
    const arm = box(0.025, 0.75, 0.025, "#2B2B30")
    arm.position.set(0.95, 1.17, -0.38)
    arm.rotation.x = 0.45
    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.17, 24, 1, true), new THREE.MeshStandardMaterial({ color: "#3A3A40", side: THREE.DoubleSide }))
    shade.position.set(0.95, 1.6, -0.15)
    shade.rotation.x = 0.5
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 16), new THREE.MeshBasicMaterial({ color: "#FFD9A8" }))
    bulb.position.set(0.95, 1.55, -0.1)
    lampGroup.add(base, arm, shade, bulb)
    scene.add(lampGroup)
    interactive.push({ mesh: shade, section: "lamp", label: "Lamp: click to switch" })

    // The chair.
    const seat = box(0.5, 0.06, 0.48, "#33333A")
    seat.position.set(0.1, 0.5, 0.55)
    const backrest = box(0.5, 0.6, 0.06, "#33333A")
    backrest.position.set(0.1, 0.85, 0.8)
    backrest.rotation.x = -0.12
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.42, 12), new THREE.MeshStandardMaterial({ color: "#1C1C20" }))
    pole.position.set(0.1, 0.26, 0.55)
    scene.add(seat, backrest, pole)

    // The shelf on the back wall: one book per skill, its name on the spine.
    const shelf = box(2.0, 0.05, 0.28, wood)
    shelf.position.set(-0.15, 1.78, -0.84)
    scene.add(shelf)
    interactive.push({ mesh: shelf, section: "skills", label: "Shelf: skills" })
    const bookColors = ["#C8553D", "#2E5266", "#E0B35A", "#4F7A5A", "#7B5EA7", "#D9D4C7", "#B5476B", "#3D6E8C"]
    const tools = site.skills.flatMap((g) => g.items)
    let x = -1.08

    // The wall board on the left wall: the roles.
    const board = box(0.04, 0.95, 1.5, "#F2EDE6")
    board.position.set(-1.96, 1.6, 0.35)
    scene.add(board)
    interactive.push({ mesh: board, section: "experience", label: "Board: experience" })

    // The note on the desk: how to reach me.
    // Paper and screens read in any light, so they are drawn unlit.
    const note = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.26), new THREE.MeshBasicMaterial({ color: "#ffffff" }))
    note.position.set(0.78, 0.93, 0.12)
    note.rotation.set(-0.35, -0.55, 0)
    note.castShadow = true
    scene.add(note)
    interactive.push({ mesh: note, section: "contact", label: "Note: contact" })

    let disposed = false
    fonts.then(() => {
      if (disposed) return
      screenMat.map = canvasTexture(1060, 620, (ctx) => {
        ctx.fillStyle = "#0F1115"
        ctx.fillRect(0, 0, 1060, 620)
        ctx.fillStyle = C.orange
        ctx.font = `800 54px ${displayFamily}`
        ctx.fillText("Selected work", 56, 110)
        ctx.font = `500 34px ${bodyFamily}`
        site.projects.forEach((p, i) => {
          ctx.fillStyle = "#F2EDE6"
          ctx.fillText(p.title, 56, 200 + i * 96)
          ctx.fillStyle = "#8C8C96"
          ctx.font = `400 24px ${bodyFamily}`
          ctx.fillText(`${p.year} · ${p.stack.slice(0, 3).join(", ")}`, 56, 236 + i * 96)
          ctx.font = `500 34px ${bodyFamily}`
        })
      })
      screenMat.needsUpdate = true

      tools.forEach((tool, i) => {
        const h = 0.26 + ((i * 37) % 9) * 0.012
        const w = 0.075 + ((i * 13) % 4) * 0.012
        const book = box(w, h, 0.2, bookColors[i % bookColors.length])
        book.position.set(x + w / 2, 1.805 + h / 2, -0.84)
        const spine = new THREE.Mesh(
          new THREE.PlaneGeometry(w * 0.9, h * 0.92),
          new THREE.MeshStandardMaterial({
            map: canvasTexture(64, 340, (ctx) => {
              ctx.fillStyle = bookColors[i % bookColors.length]
              ctx.fillRect(0, 0, 64, 340)
              ctx.save()
              ctx.translate(40, 320)
              ctx.rotate(-Math.PI / 2)
              ctx.fillStyle = i % bookColors.length === 5 ? "#15181B" : "#F7F2EA"
              ctx.font = `600 26px ${bodyFamily}`
              ctx.fillText(tool, 0, 0)
              ctx.restore()
            }),
            roughness: 0.85,
          })
        )
        spine.position.set(x + w / 2, 1.805 + h / 2, -0.739)
        scene.add(book, spine)
        interactive.push({ mesh: book, section: "skills", label: `Shelf: ${tool}` })
        x += w + 0.006
      })

      const boardFace = new THREE.Mesh(
        new THREE.PlaneGeometry(1.42, 0.88),
        new THREE.MeshStandardMaterial({
          map: canvasTexture(1420, 880, (ctx) => {
            ctx.fillStyle = "#F2EDE6"
            ctx.fillRect(0, 0, 1420, 880)
            ctx.fillStyle = "#15181B"
            ctx.font = `800 64px ${displayFamily}`
            ctx.fillText("Experience", 64, 120)
            site.experience.forEach((e, i) => {
              const y = 230 + i * 210
              ctx.fillStyle = C.orange
              ctx.fillRect(64, y - 40, 14, 14)
              ctx.fillStyle = "#15181B"
              ctx.font = `600 48px ${bodyFamily}`
              ctx.fillText(e.title, 100, y)
              ctx.fillStyle = "#55555C"
              ctx.font = `400 34px ${bodyFamily}`
              ctx.fillText(`${e.company} · ${e.start.slice(0, 4)}–${e.end === "present" ? "now" : e.end.slice(0, 4)}`, 100, y + 52)
              ctx.fillText(e.highlights[0] ?? "", 100, y + 100)
            })
          }),
          roughness: 0.9,
        })
      )
      boardFace.position.set(-1.935, 1.6, 0.35)
      boardFace.rotation.y = Math.PI / 2
      scene.add(boardFace)

      ;(note.material as THREE.MeshBasicMaterial).map = canvasTexture(340, 260, (ctx) => {
        ctx.fillStyle = "#FFE8A3"
        ctx.fillRect(0, 0, 340, 260)
        ctx.fillStyle = "#15181B"
        ctx.font = `800 30px ${displayFamily}`
        ctx.fillText("Hiring?", 22, 60)
        ctx.font = `500 20px ${bodyFamily}`
        ctx.fillText(site.email, 22, 120)
        ctx.fillText("Open to full-time roles", 22, 160)
      })
      ;(note.material as THREE.MeshBasicMaterial).needsUpdate = true
    })

    // Camera: placed between the stops for the current scroll position, with a drag offset.
    const look = new THREE.Vector3()
    const want = { pos: new THREE.Vector3(), look: new THREE.Vector3() }
    let progress = 0
    const drag = { yaw: 0, pitch: 0, tyaw: 0, tpitch: 0 }
    const far = () => (camera.aspect < 1 ? 1.75 : camera.aspect < 1.3 ? 1.25 : 1)
    const place = (p: number, out: typeof want) => {
      const s = Math.min(SECTIONS.length - 1, Math.max(0, p * (SECTIONS.length - 1)))
      const i = Math.min(SECTIONS.length - 2, Math.floor(s))
      let t = s - i
      t = reduce ? Math.round(t) : t * t * (3 - 2 * t)
      const a = STOPS[SECTIONS[i]]
      const b = STOPS[SECTIONS[i + 1]]
      const la = new THREE.Vector3(...a.look)
      const lb = new THREE.Vector3(...b.look)
      const pa = la.clone().add(new THREE.Vector3(...a.pos).sub(la).multiplyScalar(far()))
      const pb = lb.clone().add(new THREE.Vector3(...b.pos).sub(lb).multiplyScalar(far()))
      out.pos.lerpVectors(pa, pb, t)
      out.look.lerpVectors(la, lb, t)
      // On wide screens the copy sits on the left, so frame the object right of centre.
      if (camera.aspect > 1.2) {
        const right = out.look.clone().sub(out.pos).cross(new THREE.Vector3(0, 1, 0)).normalize()
        const shift = right.multiplyScalar(-0.22 * out.look.distanceTo(out.pos))
        out.pos.add(shift)
        out.look.add(shift)
      }
    }
    place(0, want)
    camera.position.copy(want.pos)
    look.copy(want.look)

    const layout = () => {
      renderer.setSize(el.clientWidth, el.clientHeight, false)
      camera.aspect = el.clientWidth / el.clientHeight
      camera.updateProjectionMatrix()
    }
    layout()
    window.addEventListener("resize", layout)

    const trigger = ScrollTrigger.create({
      trigger: page.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        progress = self.progress
      },
    })

    // Pointer: drag to look around; point at an object to light it; click to go there.
    const ray = new THREE.Raycaster()
    const ndc = new THREE.Vector2()
    let down: { x: number; y: number } | null = null
    let hovered: (typeof interactive)[number] | null = null
    const setNdc = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
    }
    const pick = () => {
      ray.setFromCamera(ndc, camera)
      const hit = ray.intersectObjects(interactive.map((i) => i.mesh), false)[0]
      return hit ? interactive.find((i) => i.mesh === hit.object) ?? null : null
    }
    const onDown = (e: PointerEvent) => {
      down = { x: e.clientX, y: e.clientY }
    }
    const onMove = (e: PointerEvent) => {
      setNdc(e)
      if (down && e.buttons) {
        drag.tyaw = Math.max(-0.45, Math.min(0.45, drag.tyaw - e.movementX * 0.004))
        drag.tpitch = Math.max(-0.2, Math.min(0.2, drag.tpitch - e.movementY * 0.003))
        return
      }
      if (e.pointerType !== "mouse") return
      const now = pick()
      if (now !== hovered) {
        hovered = now
        el.style.cursor = now ? "pointer" : "grab"
        setHint(now?.label ?? null)
      }
    }
    const onUp = (e: PointerEvent) => {
      const moved = down ? Math.hypot(e.clientX - down.x, e.clientY - down.y) : 99
      down = null
      drag.tyaw = 0
      drag.tpitch = 0
      if (moved > 6) return
      setNdc(e)
      const target = pick()
      if (!target) return
      if (target.section === "lamp") {
        lamp.intensity = lamp.intensity > 0 ? 0 : 9
        ;(bulb.material as THREE.MeshBasicMaterial).color.set(lamp.intensity > 0 ? "#FFD9A8" : "#3A3A40")
        return
      }
      document.getElementById(`desk-${target.section}`)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" })
    }
    el.addEventListener("pointerdown", onDown)
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)

    const Y = new THREE.Vector3(0, 1, 0)
    const rig = camera.position.clone()
    renderer.setAnimationLoop(() => {
      place(progress, want)
      const k = reduce ? 1 : 0.08
      rig.lerp(want.pos, k)
      look.lerp(want.look, k)
      drag.yaw += (drag.tyaw - drag.yaw) * 0.12
      drag.pitch += (drag.tpitch - drag.pitch) * 0.12
      // The drag turns the camera around what it is looking at, then springs back.
      const offset = rig.clone().sub(look).applyAxisAngle(Y, drag.yaw)
      offset.y += drag.pitch * 2
      camera.position.copy(look).add(offset)
      camera.lookAt(look)
      renderer.render(scene, camera)
    })

    return () => {
      disposed = true
      trigger.kill()
      renderer.setAnimationLoop(null)
      window.removeEventListener("resize", layout)
      el.removeEventListener("pointerdown", onDown)
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose()
          const m = o.material as THREE.MeshStandardMaterial
          m.map?.dispose()
          m.dispose()
        }
      })
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [displayFamily, bodyFamily])

  useEffect(() => {
    if (!copied) return
    const id = setTimeout(() => setCopied(false), 1800)
    return () => clearTimeout(id)
  }, [copied])

  const linkedin = site.socials.find((s) => s.label === "LinkedIn")
  const github = site.socials.find((s) => s.label === "GitHub")
  const year = (v: string) => v.slice(0, 4)
  const section = "relative flex min-h-svh items-end pb-10 lg:items-center lg:pb-0"
  const panel = "w-full max-w-md rounded-xl p-5 sm:p-7"

  return (
    <div className="font-[family-name:var(--font-onest)] selection:bg-[#FF7A1A] selection:text-black" style={{ background: C.room, color: C.text }}>
      <div ref={mount} aria-hidden className="fixed inset-0 top-11 cursor-grab touch-pan-y [&>canvas]:size-full">
        {fallback && (
          <div className="relative size-full">
            <Image src={site.illustration.src} alt="" fill sizes="100vw" className="object-cover object-[60%_40%] opacity-60" />
          </div>
        )}
      </div>
      <p aria-live="polite" className="pointer-events-none fixed right-5 bottom-5 z-20 hidden rounded-full px-4 py-2 text-[14px] font-medium lg:block" style={{ background: C.panel, opacity: hint ? 1 : 0 }}>
        {hint}
      </p>

      <div ref={page} className="pointer-events-none relative mx-auto max-w-[90rem] px-4 pt-11 sm:px-10 [&_a]:pointer-events-auto [&_button]:pointer-events-auto [&_section>div]:pointer-events-auto">
        <section id="desk-intro" aria-labelledby="dk-name" className={section}>
          <div className={panel} style={{ background: `${C.panel}F2` }}>
            <h1 id="dk-name" className="font-[family-name:var(--font-unbounded)] text-[clamp(2.25rem,5vw,4.25rem)] leading-[0.95] font-extrabold tracking-[-0.02em]">
              {site.name}
            </h1>
            <p className="mt-4 text-[clamp(1.0625rem,1.4vw,1.25rem)] leading-snug">
              {site.role}. {site.yearsOfExperience} years building and shipping full-stack products with Laravel, React and Next.js.
            </p>
            <p className="mt-3 flex items-center gap-2 font-medium" style={{ color: C.orange }}>
              <span aria-hidden className="size-2 rounded-full" style={{ background: C.orange }} />
              Open to full-time roles
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={`mailto:${site.email}`} className="inline-flex h-12 items-center rounded-full px-6 font-semibold text-black transition-transform duration-150 active:scale-[0.97]" style={{ background: C.orange }}>
                Contact me
              </a>
              <a
                href={cv ?? linkedin?.href}
                {...(!cv && { target: "_blank", rel: "noopener noreferrer" })}
                className="inline-flex h-12 items-center rounded-full border px-6 font-semibold transition-colors duration-150 hover:bg-white/10"
                style={{ borderColor: `${C.text}55` }}
              >
                {cv ? "Download CV" : "View LinkedIn"}
              </a>
            </div>
            <p className="mt-6 flex items-center gap-2 text-[14px]" style={{ color: C.soft }}>
              <IconArrowDown aria-hidden stroke={1.75} className="size-4" /> Scroll to walk around the desk. Drag to look; click an object to visit it.
            </p>
          </div>
        </section>

        <section id="desk-projects" aria-labelledby="dk-projects" className={section}>
          <div className={panel} style={{ background: `${C.panel}F2` }}>
            <h2 id="dk-projects" className="font-[family-name:var(--font-unbounded)] text-[1.75rem] font-extrabold">On the screen</h2>
            <ul className="mt-4 flex flex-col gap-4">
              {site.projects.map((p) => (
                <li key={p.slug}>
                  <p className="flex items-baseline justify-between gap-4">
                    <span className="text-[1.125rem] font-semibold">{p.title}</span>
                    <span className="text-[14px] tabular-nums" style={{ color: C.soft }}>{p.year}</span>
                  </p>
                  <p style={{ color: C.soft }}>{p.summary}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="desk-skills" aria-labelledby="dk-skills" className={section}>
          <div className={panel} style={{ background: `${C.panel}F2` }}>
            <h2 id="dk-skills" className="font-[family-name:var(--font-unbounded)] text-[1.75rem] font-extrabold">On the shelf</h2>
            <dl className="mt-4 flex flex-col gap-3">
              {site.skills.map((g) => (
                <div key={g.group} className="grid gap-1 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:gap-4">
                  <dt style={{ color: C.soft }}>{g.group}</dt>
                  <dd className="font-semibold">{g.items.join(", ")}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section id="desk-experience" aria-labelledby="dk-exp" className={section}>
          <div className={panel} style={{ background: `${C.panel}F2` }}>
            <h2 id="dk-exp" className="font-[family-name:var(--font-unbounded)] text-[1.75rem] font-extrabold">On the wall</h2>
            <ol className="mt-4 flex flex-col gap-5">
              {site.experience.map((e) => (
                <li key={e.title + e.start}>
                  <p className="flex items-baseline justify-between gap-4">
                    <span className="text-[1.125rem] font-semibold">{e.title}</span>
                    <span className="text-[14px] tabular-nums" style={{ color: C.soft }}>
                      {year(e.start)}–{e.end === "present" ? "now" : year(e.end)}
                    </span>
                  </p>
                  <p style={{ color: C.soft }}>{e.company}</p>
                  <ul className="mt-1">
                    {e.highlights.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="desk-contact" aria-labelledby="dk-contact" className={section}>
          <div className={panel} style={{ background: `${C.panel}F2` }}>
            <h2 id="dk-contact" className="font-[family-name:var(--font-unbounded)] text-[1.75rem] font-extrabold">Hiring?</h2>
            <p className="mt-2 text-[1.125rem]">I&rsquo;m looking for a full-time role. I&rsquo;d like to hear about yours.</p>
            <div className="mt-5 flex h-14 items-center justify-between gap-3 rounded-full pr-1.5 pl-5" style={{ background: "#1E1E22" }}>
              <a href={`mailto:${site.email}`} className="min-w-0 truncate font-medium underline decoration-transparent underline-offset-4 hover:decoration-current">
                {site.email}
              </a>
              <button
                type="button"
                aria-label={copied ? "Copied" : "Copy email"}
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(site.email)
                    setCopied(true)
                  } catch {
                    window.location.href = `mailto:${site.email}`
                  }
                }}
                className="grid size-11 shrink-0 place-items-center rounded-full text-black transition-transform duration-150 active:scale-95"
                style={{ background: copied ? C.orange : C.text }}
              >
                {copied ? <IconCheck aria-hidden stroke={2} className="size-5" /> : <IconCopy aria-hidden stroke={1.75} className="size-5" />}
              </button>
            </div>
            <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 font-semibold">
              {[linkedin, github].filter(Boolean).map((s) => (
                <li key={s!.label}>
                  <a href={s!.href} target="_blank" rel="noopener noreferrer" className="underline decoration-[#FF7A1A] decoration-2 underline-offset-4">
                    {s!.label}
                  </a>
                </li>
              ))}
              {cv && (
                <li>
                  <a href={cv} className="underline decoration-[#FF7A1A] decoration-2 underline-offset-4">Download CV</a>
                </li>
              )}
            </ul>
          </div>
        </section>
      </div>
    </div>
  )
}
