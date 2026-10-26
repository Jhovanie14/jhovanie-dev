import { site } from "@/content/site"

/** The design concepts under review at /concepts. One world each; the nav switches between them. */
export const concepts = [
  {
    slug: "desk",
    name: "3D desk",
    thesis: "Prototype for the full-time search: your desk as a small 3D room. Drag to look around; scrolling flies the camera to the monitor (projects), the shelf (skills), the wall board (experience) and a note on the desk (contact).",
    risk: "The heaviest page; it has to stay smooth on mid-range phones.",
  },
  {
    slug: "cracktro",
    name: "Cracktro",
    thesis: "A demoscene title screen: three layers of drifting stars, your name in bitmap type, your intro riding a sine-wave scroller. Arrows change speed, space pauses.",
    risk: "Pure nostalgia for engineers; recruiters outside that culture may just see a retro skin.",
  },
  {
    slug: "album",
    name: "Album",
    thesis: "A clear-line comic page starring your illustrations: flat colour, one even black line, panels that tell the story, a page that turns.",
    risk: "Comics read as playful; the captions have to carry real seniority.",
  },
  {
    slug: "scope",
    name: "Scope",
    thesis: "A phosphor oscilloscope on a bench. Turn the timebase and trigger to lock the trace; the channel switch reads out services, stack or experience.",
    risk: "The bench is a tool costume; it works only if the knobs are a joy to turn.",
  },
  {
    slug: "city",
    name: "Night city",
    thesis: "Your stack as a skyline: building height is real mention counts. Scroll runs the hour from blue to night, windows light, deploy trains cross the river.",
    risk: "Atmospheric; the city has to stay readable as data, not wallpaper.",
  },
  {
    slug: "exploded",
    name: "Exploded",
    thesis: "Your stack as an engineering assembly: the layers are plates that explode apart on scroll and tilt toward your pointer.",
    risk: "3D plates are a known product-page move; it lands on the labels and the precision.",
  },
  {
    slug: "views",
    name: "Two views",
    thesis: "A Swiss grid with one switch, Hiring or Have a project. The whole page re-arranges for that reader with a morph you can watch.",
    risk: "The least theatrical; the morph and the copy carry it.",
  },
  {
    slug: "toolbox",
    name: "Toolbox",
    thesis: "Every tool is a physical tag that drops into the page with weight. Throw them around; click one to see where you use it.",
    risk: "A toy first; the hire path must stay in sight while people play.",
  },
  {
    slug: "darkroom",
    name: "Darkroom",
    thesis: "A safelight-red darkroom. Your portrait develops under the pointer; the sections hang as prints on a contact sheet.",
    risk: "Moody and red; long reading in safelight colours tires the eye.",
  },
] as const

export type ConceptSlug = (typeof concepts)[number]["slug"]

/**
 * Every tool in site.ts with where it appears (services, roles, skill groups).
 * Concepts that size things by data use this count, never an opinion.
 */
export function toolMentions() {
  return site.skills.flatMap((g) =>
    g.items.map((name) => ({
      name,
      group: g.group,
      layer: g.layer ?? null,
      where: [
        ...site.services.filter((s) => s.stack.includes(name)).map((s) => s.title),
        ...site.experience.filter((e) => e.stack.includes(name)).map((e) => e.title),
        `${g.group} skills`,
      ],
    }))
  )
}
