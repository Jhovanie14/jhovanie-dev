import * as THREE from "three"
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js"

import { site } from "@/content/site"

import { BOARD, drawBoard } from "./board"
import { SCREEN } from "./screen"
import { canvasTexture, wallTexture, woodTexture } from "./textures"

export type Stop = "intro" | "projects" | "skills" | "experience" | "contact"
export type Hotspot = { mesh: THREE.Object3D; stop: Stop | "lamp"; label: string }
type Fonts = { display: string; body: string }

const ORANGE = "#FF7A1A"

function mat(color: string, opts: Partial<THREE.MeshStandardMaterialParameters> = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.75, ...opts })
}

/** A rounded box: furniture reads as made, not as primitives. */
function rbox(w: number, h: number, d: number, material: THREE.Material, r = 0.012) {
  const mesh = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2, h / 2, d / 2)), material)
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

function cyl(rt: number, rb: number, h: number, material: THREE.Material, seg = 24) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), material)
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

function picture(src: string) {
  const tex = new THREE.TextureLoader().load(src)
  tex.colorSpace = THREE.SRGBColorSpace
  // A little self-light so the prints read in a dark room.
  return new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: "#ffffff", emissiveIntensity: 0.22, roughness: 0.9 })
}

/**
 * Builds Jhovanie's desk at night. Units are metres: the desk top is 0.75 up,
 * the back wall at z = -1, the left wall at x = -2. Returns the pieces the
 * page drives: lights, the screen texture and the hotspots.
 */
export function buildRoom(scene: THREE.Scene, opts: { small: boolean; fonts: Fonts }) {
  const { fonts } = opts
  const hotspots: Hotspot[] = []

  // Light: a low cool fill, the warm desk lamp, and the monitor's own light.
  const hemi = new THREE.HemisphereLight("#8fa3d9", "#2a1c12", 0.35)
  const lamp = new THREE.PointLight("#FFB070", 9, 6, 1.6)
  lamp.position.set(0.98, 1.5, -0.12)
  lamp.castShadow = !opts.small
  lamp.shadow.mapSize.set(1024, 1024)
  lamp.shadow.bias = -0.002
  const screenLight = new THREE.PointLight("#9DB8FF", 0.7, 2.2, 2)
  screenLight.position.set(0, 1.25, -0.35)
  scene.add(hemi, lamp, screenLight)

  // The room.
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(6, 5), mat("#ffffff", { map: woodTexture("#3A2A20", "#140D08", 3), roughness: 0.85 }))
  floor.rotation.x = -Math.PI / 2
  floor.position.set(0, 0, 0.5)
  floor.receiveShadow = true
  const rug = rbox(2.2, 0.012, 1.6, mat("#2E2A33", { roughness: 1 }), 0.006)
  rug.position.set(0.1, 0.006, 0.45)
  const walls = mat("#ffffff", { map: wallTexture("#2A2A31", "#ffffff"), roughness: 0.95 })
  const back = new THREE.Mesh(new THREE.PlaneGeometry(6, 3.2), walls)
  back.position.set(0, 1.6, -1)
  back.receiveShadow = true
  const left = new THREE.Mesh(new THREE.PlaneGeometry(5, 3.2), walls)
  left.rotation.y = Math.PI / 2
  left.position.set(-2, 1.6, 0.5)
  left.receiveShadow = true
  const skirting = rbox(6, 0.08, 0.02, mat("#1E1E23"), 0.004)
  skirting.position.set(0, 0.04, -0.99)
  scene.add(floor, rug, back, left, skirting)

  // The desk: oak top on dark steel legs.
  const oak = mat("#ffffff", { map: woodTexture("#7A4E35", "#3B2416"), roughness: 0.6 })
  const steel = mat("#26262B", { metalness: 0.55, roughness: 0.4 })
  const top = rbox(2.4, 0.06, 1.0, oak, 0.02)
  top.position.set(0, 0.75, -0.35)
  scene.add(top)
  for (const [x, z] of [[-1.12, -0.78], [1.12, -0.78], [-1.12, 0.08], [1.12, 0.08]]) {
    const leg = rbox(0.05, 0.72, 0.05, steel, 0.01)
    leg.position.set(x, 0.36, z)
    scene.add(leg)
  }

  // The monitor and its screen.
  const plastic = mat("#141418", { roughness: 0.35 })
  const foot = rbox(0.32, 0.02, 0.2, plastic, 0.008)
  foot.position.set(0, 0.79, -0.56)
  const neck = rbox(0.05, 0.3, 0.04, plastic, 0.01)
  neck.position.set(0, 0.95, -0.6)
  const bezel = rbox(1.14, 0.68, 0.045, plastic, 0.02)
  bezel.position.set(0, 1.28, -0.58)
  const screenTex = canvasTexture(SCREEN.w, SCREEN.h, () => {})
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.08, 1.08 * (SCREEN.h / SCREEN.w)), new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false }))
  screen.position.set(0, 1.28, -0.556)
  scene.add(foot, neck, bezel, screen)
  hotspots.push({ mesh: screen, stop: "projects", label: "Monitor: selected work" }, { mesh: bezel, stop: "projects", label: "Monitor: selected work" })

  // Keyboard with real keycaps, a mouse.
  const kb = rbox(0.62, 0.022, 0.2, mat("#1C1C21", { roughness: 0.5 }), 0.008)
  kb.position.set(-0.05, 0.791, -0.12)
  const caps = new THREE.InstancedMesh(new RoundedBoxGeometry(0.034, 0.012, 0.032, 2, 0.004), mat("#2C2C33", { roughness: 0.55 }), 56)
  const m = new THREE.Matrix4()
  for (let r = 0, n = 0; r < 4; r++) {
    for (let c = 0; c < 14; c++, n++) {
      m.setPosition(-0.05 - 0.273 + c * 0.042, 0.807, -0.12 - 0.066 + r * 0.044)
      caps.setMatrixAt(n, m)
    }
  }
  caps.castShadow = true
  const mouse = new THREE.Mesh(new THREE.SphereGeometry(0.035, 24, 16), mat("#1C1C21", { roughness: 0.4 }))
  mouse.scale.set(0.9, 0.45, 1.4)
  mouse.position.set(0.4, 0.795, -0.1)
  mouse.castShadow = true
  scene.add(kb, caps, mouse)

  // The orange mug (the shirt from the portrait), with its handle.
  const glazed = mat(ORANGE, { roughness: 0.3 })
  const mug = cyl(0.045, 0.04, 0.1, glazed)
  mug.position.set(0.6, 0.83, -0.12)
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.026, 0.008, 10, 24), glazed)
  handle.position.set(0.648, 0.83, -0.12)
  handle.rotation.y = Math.PI / 2
  scene.add(mug, handle)

  // Headphones resting on the desk.
  const phones = new THREE.Group()
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.01, 10, 32, Math.PI), mat("#1A1A1E", { roughness: 0.5 }))
  const cupA = cyl(0.04, 0.04, 0.03, mat("#232328", { roughness: 0.6 }))
  const cupB = cupA.clone()
  cupA.rotation.z = Math.PI / 2
  cupB.rotation.z = Math.PI / 2
  cupA.position.set(-0.09, 0, 0)
  cupB.position.set(0.09, 0, 0)
  phones.add(band, cupA, cupB)
  phones.rotation.set(-Math.PI / 2, 0, 0.5)
  phones.position.set(-0.78, 0.8, -0.2)
  scene.add(phones)

  // A short stack of books and a plant at the back of the desk.
  ;[["#2E5266", 0.26], ["#C8553D", 0.24], ["#D9D4C7", 0.22]].forEach(([c, w], i) => {
    const b = rbox(w as number, 0.035, 0.18, mat(c as string), 0.006)
    b.position.set(-0.72, 0.8 + i * 0.036, -0.66)
    b.rotation.y = (i - 1) * 0.12
    scene.add(b)
  })
  const pot = cyl(0.07, 0.055, 0.13, mat("#8B5A44", { roughness: 0.9 }))
  pot.position.set(-1.0, 0.845, -0.66)
  scene.add(pot)
  const leaf = mat("#3E6B48", { roughness: 0.7 })
  for (let i = 0; i < 9; i++) {
    const l = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 8), leaf)
    const a = (i / 9) * Math.PI * 2
    l.scale.set(0.45, 1.9, 0.18)
    l.position.set(-1.0 + Math.cos(a) * 0.04, 0.99 + (i % 3) * 0.025, -0.66 + Math.sin(a) * 0.04)
    l.rotation.set(Math.sin(a) * 0.6, a, Math.cos(a) * 0.6)
    l.castShadow = true
    scene.add(l)
  }

  // The lamp: brushed metal, a warm bulb. Click it to switch it.
  const metal = mat("#3A3A41", { metalness: 0.6, roughness: 0.35 })
  const lampBase = cyl(0.09, 0.1, 0.025, metal)
  lampBase.position.set(0.98, 0.79, -0.56)
  const armA = cyl(0.012, 0.012, 0.5, metal, 12)
  armA.position.set(0.98, 1.02, -0.48)
  armA.rotation.x = 0.35
  const armB = cyl(0.012, 0.012, 0.42, metal, 12)
  armB.position.set(0.98, 1.38, -0.33)
  armB.rotation.x = -0.75
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.16, 32, 1, true), new THREE.MeshStandardMaterial({ color: "#3A3A41", metalness: 0.6, roughness: 0.35, side: THREE.DoubleSide }))
  shade.position.set(0.98, 1.56, -0.16)
  shade.rotation.x = 0.55
  shade.castShadow = true
  const bulbMat = new THREE.MeshBasicMaterial({ color: "#FFD9A8", toneMapped: false })
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.032, 16, 16), bulbMat)
  bulb.position.copy(lamp.position)
  scene.add(lampBase, armA, armB, shade, bulb)
  hotspots.push({ mesh: shade, stop: "lamp", label: "Lamp: click to switch it" })

  // The chair: fabric seat and back on a five-star base.
  const fabric = mat("#2E3440", { roughness: 1 })
  const seat = rbox(0.5, 0.07, 0.48, fabric, 0.03)
  seat.position.set(0.1, 0.5, 0.55)
  const backrest = rbox(0.48, 0.58, 0.06, fabric, 0.03)
  backrest.position.set(0.1, 0.86, 0.8)
  backrest.rotation.x = -0.12
  const pole = cyl(0.022, 0.022, 0.38, steel, 12)
  pole.position.set(0.1, 0.27, 0.55)
  scene.add(seat, backrest, pole)
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2
    const spoke = rbox(0.3, 0.025, 0.04, steel, 0.008)
    spoke.position.set(0.1 + Math.cos(a) * 0.15, 0.08, 0.55 + Math.sin(a) * 0.15)
    spoke.rotation.y = -a
    const wheel = new THREE.Mesh(new THREE.SphereGeometry(0.025, 12, 8), plastic)
    wheel.position.set(0.1 + Math.cos(a) * 0.29, 0.03, 0.55 + Math.sin(a) * 0.29)
    scene.add(spoke, wheel)
  }

  // The shelf: one book per skill, its name on the spine.
  const shelf = rbox(2.0, 0.045, 0.28, oak, 0.01)
  shelf.position.set(-0.15, 1.78, -0.84)
  scene.add(shelf)
  hotspots.push({ mesh: shelf, stop: "skills", label: "Shelf: skills" })
  const bookColors = ["#C8553D", "#2E5266", "#E0B35A", "#4F7A5A", "#7B5EA7", "#D9D4C7", "#B5476B", "#3D6E8C"]
  const tools = site.skills.flatMap((g) => g.items)
  // Books come in a few widths; with a long list they all slim down to fit the 1.9 m of shelf.
  const widths = tools.map((_, i) => 0.075 + ((i * 13) % 4) * 0.012)
  const fit = Math.min(1, 1.9 / widths.reduce((sum, w) => sum + w + 0.006, 0))
  let x = -1.08
  tools.forEach((tool, i) => {
    const color = bookColors[i % bookColors.length]
    const h = 0.26 + ((i * 37) % 9) * 0.012
    const w = widths[i] * fit
    const book = rbox(w, h, 0.2, mat(color, { roughness: 0.8 }), 0.006)
    book.position.set(x + w / 2, 1.8 + h / 2, -0.84)
    const spine = new THREE.Mesh(
      new THREE.PlaneGeometry(w * 0.86, h * 0.9),
      new THREE.MeshStandardMaterial({
        roughness: 0.85,
        map: canvasTexture(64, 340, (ctx) => {
          ctx.fillStyle = color
          ctx.fillRect(0, 0, 64, 340)
          ctx.save()
          ctx.translate(40, 320)
          ctx.rotate(-Math.PI / 2)
          ctx.fillStyle = color === "#D9D4C7" || color === "#E0B35A" ? "#15181B" : "#F7F2EA"
          ctx.font = `600 26px ${fonts.body}`
          ctx.fillText(tool, 0, 0)
          ctx.restore()
        }),
      })
    )
    spine.position.set(x + w / 2, 1.8 + h / 2, -0.7395)
    scene.add(book, spine)
    hotspots.push({ mesh: book, stop: "skills", label: `Shelf: ${tool}` })
    x += w + 0.006
  })

  // The board on the left wall: the roles.
  const corkFrame = rbox(0.04, 1.0, 1.56, mat("#3A2E26", { roughness: 0.8 }), 0.01)
  corkFrame.position.set(-1.975, 1.6, 0.35)
  const boardTex = canvasTexture(BOARD.w, BOARD.h, (ctx) => drawBoard(ctx, { selected: null, hover: null, since: 0 }, site.experience, fonts, 0, true))
  const boardFace = new THREE.Mesh(
    new THREE.PlaneGeometry(1.48, 0.92),
    new THREE.MeshStandardMaterial({
      roughness: 0.9,
      emissive: "#ffffff",
      emissiveIntensity: 0.08,
      map: boardTex,
    })
  )
  boardFace.position.set(-1.952, 1.6, 0.35)
  boardFace.rotation.y = Math.PI / 2
  scene.add(corkFrame, boardFace)
  hotspots.push({ mesh: boardFace, stop: "experience", label: "Board: experience" })

  // Prints on the back wall: the portrait, and the desk illustration.
  const frameMat = mat("#16161A", { roughness: 0.5 })
  const portraitFrame = rbox(0.6, 0.6, 0.03, frameMat, 0.008)
  portraitFrame.position.set(-1.55, 1.72, -0.98)
  const portrait = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.52), picture(site.avatar.src))
  portrait.position.set(-1.55, 1.72, -0.962)
  const posterFrame = rbox(0.72, 0.72, 0.03, frameMat, 0.008)
  posterFrame.position.set(1.48, 1.68, -0.98)
  const poster = new THREE.Mesh(new THREE.PlaneGeometry(0.64, 0.64), picture(site.illustration.src))
  poster.position.set(1.48, 1.68, -0.962)
  scene.add(portraitFrame, portrait, posterFrame, poster)
  hotspots.push({ mesh: portrait, stop: "intro", label: "Portrait: Jhovanie" }, { mesh: poster, stop: "intro", label: "Print: the desk" })

  // The note on the desk: how to reach me.
  const note = new THREE.Mesh(
    new THREE.PlaneGeometry(0.34, 0.26),
    new THREE.MeshBasicMaterial({
      map: canvasTexture(340, 260, (ctx) => {
        ctx.fillStyle = "#FFE8A3"
        ctx.fillRect(0, 0, 340, 260)
        ctx.fillStyle = "#15181B"
        ctx.font = `800 30px ${fonts.display}`
        ctx.fillText(site.contact.title, 22, 60)
        ctx.font = `500 20px ${fonts.body}`
        ctx.fillText(site.email, 22, 120)
        ctx.fillText(site.availability, 22, 160)
      }),
    })
  )
  note.position.set(0.8, 0.93, 0.1)
  note.rotation.set(-0.35, -0.55, 0)
  scene.add(note)
  hotspots.push({ mesh: note, stop: "contact", label: "Note: get in touch" })

  return { hemi, lamp, screenLight, bulbMat, screenTex, screen, boardTex, board: boardFace, hotspots }
}
