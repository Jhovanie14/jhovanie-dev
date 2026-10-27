"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import * as THREE from "three"
import { IconArrowDown, IconArrowLeft, IconArrowRight, IconArrowsMaximize, IconCheck, IconCopy } from "@tabler/icons-react"

import { site, yearSpan } from "@/content/site"
import { gsap, ScrollTrigger } from "@/lib/gsap"
import { cn } from "@/lib/utils"

import { BOARD_TIME, boardHit, drawBoard, type BoardState } from "./board"
import { createBookReader, skillUses } from "./book"
import { buildRoom, type Stop } from "./room"
import { ALL, drawScreen, folderItems, folders, PAGE, pageCount, screenHit, shotOnScreen, SLIDE_TIME, type ScreenState, type Shots } from "./screen"
import { ShotViewer } from "./shot-viewer"
import { redraw } from "./textures"

/*
 * The site: Jhovanie's desk at night, in real-time 3D. Scrolling (or the nav)
 * flies the camera between stops: the room, the monitor (projects, each one
 * opening as a case study on the screen), the shelf (skills), the board
 * (experience) and a note on the desk (contact). The copy for each stop sits
 * in a panel beside the scene, so everything reads without the 3D.
 */

const STOPS: Stop[] = ["intro", "projects", "skills", "experience", "contact"]
const CAMERA: Record<Stop, { pos: [number, number, number]; look: [number, number, number] }> = {
  intro: { pos: [3.4, 2.3, 3.8], look: [-0.2, 1.05, -0.2] },
  projects: { pos: [0.05, 1.28, 1.15], look: [0.05, 1.2, -0.3] },
  skills: { pos: [-0.15, 2.05, 1.05], look: [-0.15, 2.05, -0.95] },
  experience: { pos: [-0.2, 1.6, 0.35], look: [-1.9, 1.6, 0.35] },
  contact: { pos: [1.35, 1.25, 1.05], look: [0.75, 0.93, 0.15] },
}
const NAV: { stop: Stop; label: string }[] = [
  { stop: "projects", label: "Work" },
  { stop: "skills", label: "Skills" },
  { stop: "experience", label: "Experience" },
  { stop: "contact", label: "Contact" },
]

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

const go = (stop: Stop, smooth = true) => document.getElementById(stop)?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" })

/** A project's screenshots as served from public/ (cover first), with pixel sizes. Only files that exist are passed. */
export type ShotPaths = { src: string; alt: string; width: number; height: number }[]

export function DeskSite({ cv, build, shots }: { cv: string | null; build: string | null; shots: ShotPaths[] }) {
  const mount = useRef<HTMLDivElement>(null)
  const scrollArea = useRef<HTMLDivElement>(null)
  const [fallback, setFallback] = useState(false)
  const [copied, setCopied] = useState(false)
  const [hint, setHint] = useState<string | null>(null)
  const [current, setCurrent] = useState<Stop>("intro")
  const [project, setProject] = useState<number | null>(null)
  // The 3D side reads and writes the open project through this bridge.
  const bridge = useRef<{
    open: (i: number | null, image: number, page: number, folder: string) => void
    role: (i: number | null) => void
    skill: (tool: string | null) => void
  }>({
    open: () => {},
    role: () => {},
    skill: () => {},
  })
  // The skill whose book is open off the shelf, shared with the panel.
  const [skill, setSkill] = useState<string | null>(null)
  // The role open on the experience board, shared with the panel.
  const [role, setRole] = useState<number | null>(null)
  const [shot, setShot] = useState(0)
  // The open folder of work and its page, shared by the monitor and the panel.
  const [folder, setFolder] = useState(ALL)
  const [page, setPage] = useState(0)
  const items = folderItems(site.projects, folder)
  const pages = pageCount(items.length)
  const openFolder = (id: string) => {
    setFolder(id)
    setPage(0)
  }
  // The screenshot open full size, if any; the room stops rendering underneath it.
  const [viewing, setViewing] = useState<number | null>(null)
  const frozen = useRef(false)
  const openProject = (i: number | null) => {
    setShot(0)
    setProject(i)
  }

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
    renderer.shadowMap.type = THREE.PCFShadowMap
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    scene.background = new THREE.Color("#0D0D10")
    const camera = new THREE.PerspectiveCamera(40, 1, 0.05, 40)
    const css = getComputedStyle(document.documentElement)
    const fonts = { display: css.getPropertyValue("--font-unbounded").trim() || "sans-serif", body: css.getPropertyValue("--font-onest").trim() || "sans-serif" }

    let disposed = false
    let room: ReturnType<typeof buildRoom> | null = null
    let screenState: ScreenState = reduce ? { mode: "list", hover: null, folder: ALL, page: 0 } : { mode: "off" }
    // The folder the list was last showing, so "All projects" on a case study returns to it.
    let listFolder = ALL
    let boardState: BoardState = { selected: null, hover: null, since: 0 }
    const paintBoard = () => room && redraw(room.boardTex, (ctx) => drawBoard(ctx, boardState, site.experience, fonts, now(), reduce))
    bridge.current.role = (i) => {
      if (i === boardState.selected) return
      boardState = { selected: i, hover: boardState.hover, since: now() }
      paintBoard()
    }
    // Opening a role draws the camera in towards the board (0..1, eased in the render loop).
    let zoom = 0
    // The open book, once the room exists; and the camera's small step towards it.
    let reader: ReturnType<typeof createBookReader> | null = null
    let wantedSkill: string | null = null
    let bookZoom = 0
    bridge.current.skill = (tool) => {
      wantedSkill = tool
      reader?.show(tool)
    }
    const now = () => performance.now() / 1000
    // Each project's screenshots, loaded once in the browser.
    const loaded: (Shots | undefined)[] = []
    const paint = () => room && redraw(room.screenTex, (ctx) => drawScreen(ctx, screenState, site.projects, fonts, loaded, now(), reduce))
    shots.forEach((list, i) => {
      if (list.length === 0) return
      Promise.all(
        list.map((s) => {
          const img = new window.Image()
          img.src = s.src
          return img.decode().then(() => img)
        })
      )
        .then((imgs) => {
          loaded[i] = imgs
          paint()
        })
        .catch(() => {})
    })

    bridge.current.open = (i, image, page, folder) => {
      listFolder = folder
      if (i !== null) screenState = { mode: "detail", index: i, image, since: now() }
      else if (screenState.mode === "list" && screenState.folder !== folder) {
        // Another folder fades in.
        screenState = { mode: "list", hover: null, folder, page, since: now() }
      } else if (screenState.mode === "list" && screenState.page !== page) {
        // A new page slides in over the old one.
        screenState = { mode: "list", hover: null, folder, page, slide: { from: screenState.page, since: now() } }
      } else if (screenState.mode !== "off" && screenState.mode !== "boot") screenState = { mode: "list", hover: null, folder, page }
      paint()
    }

    // Camera: placed between the stops for the scroll position; wide screens frame the object right of the copy.
    const want = { pos: new THREE.Vector3(), look: new THREE.Vector3() }
    const far = () => (camera.aspect < 1 ? 1.75 : camera.aspect < 1.3 ? 1.25 : 1)
    const place = (p: number) => {
      const s = Math.min(STOPS.length - 1, Math.max(0, p * (STOPS.length - 1)))
      const i = Math.min(STOPS.length - 2, Math.floor(s))
      let t = s - i
      t = reduce ? Math.round(t) : t * t * (3 - 2 * t)
      const a = CAMERA[STOPS[i]]
      const b = CAMERA[STOPS[i + 1]]
      const la = new THREE.Vector3(...a.look)
      const lb = new THREE.Vector3(...b.look)
      const pa = la.clone().add(new THREE.Vector3(...a.pos).sub(la).multiplyScalar(far()))
      const pb = lb.clone().add(new THREE.Vector3(...b.pos).sub(lb).multiplyScalar(far()))
      want.pos.lerpVectors(pa, pb, t)
      want.look.lerpVectors(la, lb, t)
      // At the board with a role open: step in, and centre on the role's card (to the right of the board, -z).
      const near = Math.max(0, 1 - Math.abs(s - STOPS.indexOf("experience"))) * zoom
      // At the shelf with a book open: a small step in.
      const atShelf = Math.max(0, 1 - Math.abs(s - STOPS.indexOf("skills"))) * bookZoom
      if (atShelf > 0) want.pos.lerp(want.look, 0.12 * atShelf)
      if (near > 0) {
        want.pos.lerp(want.look, 0.14 * near)
        const towardCard = new THREE.Vector3(0, 0, -0.38 * near)
        want.pos.add(towardCard)
        want.look.add(towardCard)
      }
      if (camera.aspect > 1.2) {
        const right = want.look.clone().sub(want.pos).cross(new THREE.Vector3(0, 1, 0)).normalize()
        const shift = right.multiplyScalar(-0.22 * want.look.distanceTo(want.pos))
        want.pos.add(shift)
        want.look.add(shift)
      }
    }

    const layout = () => {
      renderer.setSize(el.clientWidth, el.clientHeight, false)
      camera.aspect = el.clientWidth / el.clientHeight
      camera.updateProjectionMatrix()
    }
    layout()
    window.addEventListener("resize", layout)

    let progress = 0
    place(0)
    // The entrance: the camera starts out at the doorway and glides in.
    const rig = reduce ? want.pos.clone() : want.pos.clone().add(new THREE.Vector3(2.2, 1.2, 2.6))
    const look = want.look.clone()
    camera.position.copy(rig)

    const trigger = ScrollTrigger.create({
      trigger: scrollArea.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        progress = self.progress
      },
    })

    Promise.all([document.fonts.load(`800 60px ${fonts.display}`), document.fonts.load(`500 30px ${fonts.body}`)]).then(() => {
      if (disposed) return
      room = buildRoom(scene, { small, fonts })
      reader = createBookReader(scene, room.books, fonts, { reduce, aspect: () => camera.aspect })
      for (const mesh of reader.meshes) room.hotspots.push({ mesh, stop: "skills", label: "Close the book" })
      reader.show(wantedSkill)
      paint()
      if (reduce) return
      // Lights up: the lamp catches, the room fills, the monitor boots, then shows the work.
      room.lamp.intensity = 0
      room.hemi.intensity = 0
      room.screenLight.intensity = 0
      room.bulbMat.color.set("#3A3A40")
      const r = room
      gsap
        .timeline({ delay: 0.3 })
        .to(r.lamp, { intensity: 4, duration: 0.07 })
        .to(r.lamp, { intensity: 0.6, duration: 0.07 })
        .to(r.lamp, { intensity: 9, duration: 0.7, ease: "power2.out", onStart: () => void r.bulbMat.color.set("#FFD9A8") })
        .to(r.hemi, { intensity: 0.35, duration: 1.2 }, "<")
        .call(() => {
          screenState = { mode: "boot" }
          paint()
        }, [], 0.6)
        .to(r.screenLight, { intensity: 0.7, duration: 0.6 }, 0.6)
        .call(() => {
          screenState = project === null ? { mode: "list", hover: null, folder: ALL, page: 0 } : { mode: "detail", index: project, image: 0, since: now() }
          paint()
        }, [], 1.7)
      gsap.fromTo("[data-load]", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.6, ease: "expo.out", delay: 0.25 })
    })

    // Pointer: drag to look around; point at an object to name it; click to go there.
    const ray = new THREE.Raycaster()
    const ndc = new THREE.Vector2()
    const drag = { yaw: 0, pitch: 0, tyaw: 0, tpitch: 0 }
    let down: { x: number; y: number } | null = null
    const setNdc = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
    }
    const pick = () => {
      if (!room) return null
      ray.setFromCamera(ndc, camera)
      const hit = ray.intersectObjects(room.hotspots.map((h) => h.mesh), false)[0]
      if (!hit) return null
      return { spot: room.hotspots.find((h) => h.mesh === hit.object)!, uv: hit.uv }
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
      if (e.pointerType !== "mouse" || !room) return
      const now = pick()
      el.style.cursor = now ? "pointer" : "grab"
      setHint(now?.spot.label ?? null)
      // Roles on the board light up under the pointer.
      const onBoard = now?.spot.mesh === room.board && now.uv ? boardHit(boardState, now.uv, site.experience.length) : null
      if (onBoard !== boardState.hover) {
        boardState = { ...boardState, hover: onBoard }
        paintBoard()
      }
      // Cards on the screen light up under the pointer.
      if (screenState.mode === "list") {
        const hit = now?.spot.mesh === room.screen && now.uv ? screenHit(screenState, now.uv, site.projects) : null
        const hover = hit && "row" in hit ? hit.row : null
        if (hover !== screenState.hover) {
          screenState = { ...screenState, hover }
          paint()
        }
      }
    }
    const onUp = (e: PointerEvent) => {
      const moved = down ? Math.hypot(e.clientX - down.x, e.clientY - down.y) : 99
      down = null
      drag.tyaw = 0
      drag.tpitch = 0
      if (moved > 6 || !room) return
      setNdc(e)
      const hit = pick()
      if (!hit) return
      if (hit.spot.stop === "lamp") {
        const on = room.lamp.intensity > 0
        room.lamp.intensity = on ? 0 : 9
        room.bulbMat.color.set(on ? "#3A3A40" : "#FFD9A8")
        return
      }
      // A book on the shelf opens; the open book (or its own book again) closes.
      if (reader) {
        const book = room.books.find((b) => b.mesh === hit.spot.mesh)
        if (reader.meshes.includes(hit.spot.mesh)) setSkill(null)
        else if (book) setSkill(book.tool === reader.open ? null : book.tool)
      }
      // A role on the board opens it; the open one closes.
      if (hit.spot.mesh === room.board && hit.uv) {
        const i = boardHit(boardState, hit.uv, site.experience.length)
        if (i !== null) setRole(i === boardState.selected ? null : i)
      }
      if (hit.spot.mesh === room.screen && hit.uv) {
        const target = screenHit(screenState, hit.uv, site.projects)
        if (target && "row" in target) openProject(target.row)
        if (target && "folder" in target) openFolder(target.folder)
        if (target && "page" in target && screenState.mode === "list") setPage(screenState.page + target.page)
        if (target && "back" in target && screenState.mode === "detail") {
          // Back to the page of the folder the project is on.
          setPage(Math.floor(Math.max(0, folderItems(site.projects, listFolder).indexOf(screenState.index)) / PAGE))
          openProject(null)
        }
        // Clicking the screenshot playing on the screen opens it full size.
        if (target && "shot" in target && screenState.mode === "detail") {
          const count = loaded[screenState.index]?.length
          if (count) setViewing(shotOnScreen(screenState, now(), reduce) % count)
        }
      }
      go(hit.spot.stop, !reduce)
    }
    el.addEventListener("pointerdown", onDown)
    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)

    const Y = new THREE.Vector3(0, 1, 0)
    let frame = 0
    renderer.setAnimationLoop(() => {
      if (frozen.current) return
      // An open case study with screenshots keeps playing on the screen (about 30 fps).
      if (!reduce && screenState.mode === "detail" && loaded[screenState.index]?.length && frame++ % 2 === 0) paint()
      zoom += ((boardState.selected === null ? 0 : 1) - zoom) * (reduce ? 1 : 0.08)
      bookZoom += ((reader?.open ? 1 : 0) - bookZoom) * (reduce ? 1 : 0.06)
      if (!reduce && now() - boardState.since < BOARD_TIME + 0.05) paintBoard()
      // A page turn or a newly opened folder repaints every frame while it moves.
      if (screenState.mode === "list") {
        const moving = (screenState.slide && now() - screenState.slide.since < SLIDE_TIME + 0.05) || (screenState.since !== undefined && now() - screenState.since < 0.4)
        if (moving) paint()
      }
      place(progress)
      const k = reduce ? 1 : 0.06
      rig.lerp(want.pos, k)
      look.lerp(want.look, k)
      drag.yaw += (drag.tyaw - drag.yaw) * 0.12
      drag.pitch += (drag.tpitch - drag.pitch) * 0.12
      const offset = rig.clone().sub(look).applyAxisAngle(Y, drag.yaw)
      offset.y += drag.pitch * 2
      camera.position.copy(look).add(offset)
      camera.lookAt(look)
      renderer.render(scene, camera)
    })

    return () => {
      disposed = true
      reader?.dispose()
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
    // The scene is built once; `project` only seeds the screen at boot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // The open project drives the screen too.
  useEffect(() => {
    bridge.current.open(project, shot, page, folder)
  }, [project, shot, page, folder])

  useEffect(() => {
    bridge.current.role(role)
  }, [role])

  useEffect(() => {
    bridge.current.skill(skill)
  }, [skill])

  // The panel's open role unfolds with the board.
  const roleDetail = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (role === null || !roleDetail.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    gsap.fromTo(roleDetail.current, { opacity: 0, y: -6 }, { opacity: 1, y: 0, duration: 0.4, ease: "expo.out", clearProps: "all" })
  }, [role])

  // The panel's list moves too: it slides with a page turn and fades up with a new folder.
  const list = useRef<HTMLUListElement>(null)
  const shown = useRef({ page, folder })
  useEffect(() => {
    const dir = shown.current.folder === folder ? Math.sign(page - shown.current.page) : 0
    const changed = shown.current.folder !== folder || dir !== 0
    shown.current = { page, folder }
    if (!changed || !list.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    gsap.fromTo(list.current, { x: dir * 40, y: dir ? 0 : 10, opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 0.45, ease: "expo.out", clearProps: "all" })
  }, [page, folder])

  useEffect(() => {
    frozen.current = viewing !== null
  }, [viewing])

  // Which stop is on screen, for the nav.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setCurrent(e.target.id as Stop)),
      { rootMargin: "-45% 0px -45% 0px" }
    )
    STOPS.forEach((s) => {
      const node = document.getElementById(s)
      if (node) io.observe(node)
    })
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!copied) return
    const id = setTimeout(() => setCopied(false), 1800)
    return () => clearTimeout(id)
  }, [copied])

  const linkedin = site.socials.find((s) => s.label === "LinkedIn")
  const github = site.socials.find((s) => s.label === "GitHub")
  const whatsapp = site.socials.find((s) => s.label === "WhatsApp")
  const open = project === null ? null : site.projects[project]

  const section = "relative flex min-h-svh items-end pt-20 pb-10 lg:items-center lg:pb-0"
  const panel = "pointer-events-auto max-h-[calc(100svh-8rem)] w-full max-w-md overflow-y-auto overscroll-contain rounded-[var(--radius)] bg-card/95 p-5 sm:p-7"
  const heading = "font-heading text-[1.75rem] font-extrabold tracking-[-0.01em]"

  return (
    <div className="bg-background text-foreground">
      {/* The room: fixed behind the copy for the whole page. */}
      <div ref={mount} aria-hidden className="fixed inset-0 cursor-grab touch-pan-y [&>canvas]:size-full">
        {fallback && <Image src={site.illustration.src} alt="" fill priority sizes="100vw" className="object-cover object-[60%_40%] opacity-60" />}
      </div>

      {/* The bar: name, the stops, one action. */}
      <header className="fixed inset-x-0 top-0 z-30">
        <div className="mx-auto flex h-16 max-w-[90rem] items-center justify-between gap-4 px-4 sm:px-10">
          <button type="button" onClick={() => go("intro")} className="font-heading text-[15px] font-extrabold">
            {site.name}
          </button>
          <nav aria-label="Sections" className="hidden md:block">
            <ul className="flex items-center gap-1 rounded-full bg-card/90 p-1 text-[15px]">
              {NAV.map((n) => (
                <li key={n.stop}>
                  <button
                    type="button"
                    onClick={() => go(n.stop)}
                    aria-current={current === n.stop ? "true" : undefined}
                    className={cn("h-9 rounded-full px-4 transition-colors duration-200", current === n.stop ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}
                  >
                    {n.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <a href={`mailto:${site.email}`} className="inline-flex h-10 items-center rounded-full bg-primary px-5 text-[15px] font-semibold text-primary-foreground transition-transform duration-150 hover:bg-primary-hover active:scale-[0.97]">
            Contact me
          </a>
        </div>
      </header>

      <p aria-live="polite" className={cn("pointer-events-none fixed right-6 bottom-6 z-20 hidden rounded-full bg-card px-4 py-2 text-[14px] font-medium transition-opacity duration-200 lg:block", hint ? "opacity-100" : "opacity-0")}>
        {hint}
      </p>

      <main ref={scrollArea} className="pointer-events-none relative mx-auto max-w-[90rem] px-4 sm:px-10">
        <section id="intro" aria-labelledby="name" className={section}>
          <div data-load className={panel}>
            <h1 id="name" className="font-heading text-[clamp(2.25rem,5vw,4.25rem)] leading-[0.95] font-extrabold tracking-[-0.02em]">
              {site.name}
            </h1>
            <p className="mt-4 text-[clamp(1.0625rem,1.4vw,1.25rem)] leading-snug">
              {site.role}. {site.intro}
            </p>
            <p className="mt-3 flex items-center gap-2 font-medium text-accent-ink">
              <span aria-hidden className="size-2 rounded-full bg-primary" />
              {site.availability}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={`mailto:${site.email}`} className="inline-flex h-12 items-center rounded-full bg-primary px-6 font-semibold text-primary-foreground transition-transform duration-150 hover:bg-primary-hover active:scale-[0.97]">
                Contact me
              </a>
              <a
                href={cv ?? linkedin?.href}
                {...(!cv && { target: "_blank", rel: "noopener noreferrer" })}
                className="inline-flex h-12 items-center rounded-full border border-foreground/30 px-6 font-semibold transition-colors duration-150 hover:bg-foreground/10"
              >
                {cv ? "Download CV" : "View LinkedIn"}
              </a>
            </div>
            <p className="mt-6 flex items-center gap-2 text-[14px] text-muted-foreground">
              <IconArrowDown aria-hidden stroke={1.75} className="size-4" /> Scroll to walk around the desk. Drag to look; click anything to visit it.
            </p>
          </div>
        </section>

        <section id="projects" aria-labelledby="projects-title" className={section}>
          <div className={panel}>
            {open ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setPage(Math.floor(Math.max(0, items.indexOf(project!)) / PAGE))
                    openProject(null)
                  }}
                  className="flex items-center gap-2 text-[15px] font-semibold text-accent-ink"
                >
                  <IconArrowLeft aria-hidden stroke={2} className="size-4" /> All projects
                </button>
                <h2 id="projects-title" className={cn(heading, "mt-3")}>
                  {open.title}
                </h2>
                <p className="mt-1 text-muted-foreground">
                  {open.month ? `${MONTHS[open.month - 1]} ` : ""}
                  {open.year} · {open.role}
                </p>
                {/* The screenshots playing on the monitor; each opens full size. */}
                {shots[project!]?.length > 0 && (
                  <>
                    <ul aria-label="Screenshots" className="mt-4 flex gap-2 overflow-x-auto pb-1">
                      {shots[project!].map((s, k) => (
                        <li key={s.src} className="shrink-0">
                          <button
                            type="button"
                            data-shot={k}
                            onClick={() => {
                              setShot(k)
                              setViewing(k)
                            }}
                            aria-label={`View screenshot ${k + 1} full size: ${s.alt}`}
                            className={cn("relative block h-16 w-28 overflow-hidden rounded-md outline-2 outline-offset-2 transition-[outline-color] duration-150", shot === k ? "outline-primary" : "outline-transparent hover:outline-foreground/40")}
                          >
                            <Image src={s.src} alt="" fill sizes="7rem" className="object-cover object-top" />
                          </button>
                        </li>
                      ))}
                    </ul>
                    <p className="mt-1 flex items-center gap-1.5 text-[14px] text-muted-foreground">
                      <IconArrowsMaximize aria-hidden stroke={1.75} className="size-4" /> Tap a screenshot to see it full size.
                    </p>
                  </>
                )}
                <dl className="mt-4 flex flex-col gap-3">
                  {[
                    ["Problem", open.problem],
                    ["Solution", open.solution],
                    ["Stack", open.stack.join(", ")],
                    ["Outcome", open.outcome],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-[14px] font-semibold text-accent-ink">{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
              </>
            ) : (
              <>
                <h2 id="projects-title" className={heading}>
                  On the screen
                </h2>
                <p className="mt-1 text-muted-foreground">Open a project here or on the monitor.</p>
                {/* The monitor's folders, once there is more than one kind of work. */}
                {folders(site.projects).length > 2 && (
                  <div role="group" aria-label="Filter projects" className="mt-4 flex flex-wrap gap-2">
                    {folders(site.projects).map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => openFolder(f.id)}
                        aria-pressed={folder === f.id}
                        className={cn(
                          "h-9 rounded-full px-4 text-[14px] font-medium transition-colors duration-150",
                          folder === f.id ? "bg-foreground text-background" : "bg-popover text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {f.label} <span className="tabular-nums opacity-60">{f.items.length}</span>
                      </button>
                    ))}
                  </div>
                )}
                <ul ref={list} className="mt-4 flex flex-col gap-1">
                  {items.slice(page * PAGE, page * PAGE + PAGE).map((i) => site.projects[i]).map((p, k) => (
                    <li key={p.slug}>
                      <button type="button" onClick={() => openProject(items[page * PAGE + k])} className="w-full rounded-lg px-3 py-2.5 text-left transition-colors duration-150 hover:bg-foreground/10">
                        <span className="flex items-baseline justify-between gap-4">
                          <span className="text-[1.125rem] font-semibold">{p.title}</span>
                          <span className="text-[14px] text-muted-foreground tabular-nums">{p.year}</span>
                        </span>
                        <span className="block text-muted-foreground">{p.summary}</span>
                      </button>
                    </li>
                  ))}
                </ul>
                {pages > 1 && (
                  <nav aria-label="Project pages" className="mt-4 flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 0}
                      aria-label="Previous projects"
                      className="grid size-11 place-items-center rounded-full bg-popover transition-[background-color,opacity] duration-150 hover:bg-foreground/15 disabled:opacity-35"
                    >
                      <IconArrowLeft aria-hidden stroke={2} className="size-5" />
                    </button>
                    <p aria-live="polite" className="text-[14px] text-muted-foreground tabular-nums">
                      Page {page + 1} of {pages}
                    </p>
                    <button
                      type="button"
                      onClick={() => setPage(page + 1)}
                      disabled={page === pages - 1}
                      aria-label="More projects"
                      className="grid size-11 place-items-center rounded-full bg-popover transition-[background-color,opacity] duration-150 hover:bg-foreground/15 disabled:opacity-35"
                    >
                      <IconArrowRight aria-hidden stroke={2} className="size-5" />
                    </button>
                  </nav>
                )}
              </>
            )}
          </div>
        </section>

        <section id="skills" aria-labelledby="skills-title" className={section}>
          <div className={panel}>
            <h2 id="skills-title" className={heading}>
              On the shelf
            </h2>
            <p className="mt-1 text-muted-foreground">Open a book here or on the shelf to see where I used it.</p>
            <dl className="mt-4 flex flex-col gap-3">
              {site.skills.map((g) => (
                <div key={g.group} className="grid gap-1.5 sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:gap-4">
                  <dt className="pt-1.5 text-muted-foreground">{g.group}</dt>
                  <dd className="flex flex-wrap gap-1.5">
                    {g.items.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSkill(skill === t ? null : t)}
                        aria-pressed={skill === t}
                        className={cn(
                          "h-9 rounded-full px-3.5 text-[15px] font-semibold transition-colors duration-150",
                          skill === t ? "bg-primary text-primary-foreground" : "bg-popover hover:bg-foreground/15"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </dd>
                  {/* On phones the panel covers the shelf, so the open book's pages are repeated here. */}
                  {skill && g.items.includes(skill) && (
                    <div className="mt-2 rounded-lg bg-popover p-4 sm:col-span-2 lg:hidden">
                      <SkillUses skill={skill} />
                    </div>
                  )}
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section id="experience" aria-labelledby="experience-title" className={section}>
          <div className={panel}>
            <h2 id="experience-title" className={heading}>
              On the wall
            </h2>
            <p className="mt-1 text-muted-foreground">Open a role here or on the board.</p>
            <ol className="mt-4 flex flex-col gap-1">
              {site.experience.map((e, i) => (
                <li key={e.title + e.start}>
                  <button
                    type="button"
                    onClick={() => setRole(role === i ? null : i)}
                    aria-expanded={role === i}
                    className={cn("w-full rounded-lg px-3 py-2.5 text-left transition-colors duration-150", role === i ? "bg-primary text-primary-foreground" : "hover:bg-foreground/10")}
                  >
                    <span className="flex items-baseline justify-between gap-4">
                      <span className="text-[1.125rem] font-semibold">{e.title}</span>
                      <span className={cn("shrink-0 text-[14px] whitespace-nowrap tabular-nums", role === i ? "text-primary-foreground/80" : "text-muted-foreground")}>{yearSpan(e.start, e.end)}</span>
                    </span>
                    <span className={cn("block", role === i ? "text-primary-foreground/80" : "text-muted-foreground")}>{e.company}</span>
                  </button>
                  {role === i && (
                    <div ref={roleDetail} className="px-3 pt-3 pb-2">
                      <ul className="flex flex-col gap-2">
                        {e.highlights.map((h) => (
                          <li key={h} className="flex gap-3">
                            <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary" />
                            {h}
                          </li>
                        ))}
                      </ul>
                      {e.stack.length > 0 && (
                        <ul aria-label="Stack" className="mt-3 flex flex-wrap gap-1.5">
                          {e.stack.map((t) => (
                            <li key={t} className="rounded-full bg-popover px-3 py-1 text-[13px]">
                              {t}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="contact" aria-labelledby="contact-title" className={section}>
          <div className={panel}>
            <h2 id="contact-title" className={heading}>
              {site.contact.title}
            </h2>
            <p className="mt-2 text-[1.125rem]">{site.contact.body}</p>
            <div className="mt-5 flex h-14 items-center justify-between gap-3 rounded-full bg-popover pr-1.5 pl-5">
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
                className={cn("grid size-11 shrink-0 place-items-center rounded-full text-background transition-transform duration-150 active:scale-95", copied ? "bg-primary" : "bg-foreground")}
              >
                {copied ? <IconCheck aria-hidden stroke={2} className="size-5" /> : <IconCopy aria-hidden stroke={1.75} className="size-5" />}
              </button>
            </div>
            <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2 font-semibold">
              {[linkedin, github, whatsapp].filter(Boolean).map((s) => (
                <li key={s!.label}>
                  <a href={s!.href} target="_blank" rel="noopener noreferrer" className="underline decoration-primary decoration-2 underline-offset-4">
                    {s!.label}
                  </a>
                </li>
              ))}
              {cv && (
                <li>
                  <a href={cv} className="underline decoration-primary decoration-2 underline-offset-4">
                    Download CV
                  </a>
                </li>
              )}
            </ul>
            <p className="mt-8 text-[13px] text-muted-foreground">
              © {new Date().getFullYear()} {site.name} · Built with Next.js and Three.js{build ? ` · build ${build}` : ""}
            </p>
          </div>
        </section>
      </main>

      {open && shots[project!]?.length > 0 && (
        <ShotViewer
          title={open.title}
          shots={shots[project!]}
          index={viewing}
          onIndex={setViewing}
          onClose={(k) => {
            setViewing(null)
            setShot(k)
          }}
          origin={(k) => document.querySelector<HTMLElement>(`[data-shot="${k}"]`)}
        />
      )}
    </div>
  )
}

/** Where a skill was used: the projects and roles whose stack includes it. */
function SkillUses({ skill }: { skill: string }) {
  const { projects, roles } = skillUses(skill)
  if (!projects.length && !roles.length) return <p>Used every day for AI-assisted development, architecture review and code quality.</p>
  return (
    <dl className="flex flex-col gap-3 text-[15px]">
      {projects.length > 0 && (
        <div>
          <dt className="text-[13px] font-semibold tracking-wide text-accent-ink uppercase">Projects</dt>
          {projects.map((p) => (
            <dd key={p.slug} className="mt-1">
              <span className="font-semibold">{p.title}</span> <span className="text-muted-foreground">· {p.year}</span>
            </dd>
          ))}
        </div>
      )}
      {roles.length > 0 && (
        <div>
          <dt className="text-[13px] font-semibold tracking-wide text-accent-ink uppercase">Roles</dt>
          {roles.map((r) => (
            <dd key={r.company + r.start} className="mt-1">
              <span className="font-semibold">{r.company}</span> <span className="text-muted-foreground">· {r.title}</span>
            </dd>
          ))}
        </div>
      )}
    </dl>
  )
}
