import { z } from "zod"

/**
 * Single source of truth for all site content.
 * Values marked TODO are placeholders — replace them before launch.
 */

const imageSchema = z.object({
  src: z.string().startsWith("/"),
  alt: z.string().min(1),
  caption: z.string().optional(),
})

const socialSchema = z.object({
  label: z.string(),
  href: z.url(),
})

const navItemSchema = z.object({
  label: z.string(),
  href: z.string().startsWith("/", "nav items are real routes, not #anchors"),
})

const projectSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, "slug must be kebab-case"),
  title: z.string().min(1),
  summary: z.string().max(140),
  year: z.number().int().min(2000),
  role: z.string(),
  problem: z.string(),
  solution: z.string(),
  outcome: z.string(),
  stack: z.array(z.string()).min(1),
  links: z.object({
    live: z.url().optional(),
    repo: z.url().optional(),
  }),
  cover: imageSchema,
  gallery: z.array(imageSchema).default([]),
  featured: z.boolean().default(true),
  placeholder: z.boolean().default(false),
})

const experienceSchema = z.object({
  company: z.string(),
  title: z.string(),
  start: z.string().regex(/^\d{4}-\d{2}$/, "use YYYY-MM"),
  end: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .or(z.literal("present")),
  location: z.string().optional(),
  highlights: z.array(z.string()).max(4),
  stack: z.array(z.string()).default([]),
})

/** The layers a request passes through, outermost first. The hero trace walks them in this order. */
export const layers = ["edge", "interface", "api", "data"] as const

const skillGroupSchema = z.object({
  group: z.string(),
  items: z.array(z.string()).min(1),
  /** Where this group sits on the request path, if it does. */
  layer: z.enum(layers).optional(),
  /** One sentence on what I do at this layer. */
  note: z.string().optional(),
})

export const siteSchema = z.object({
  name: z.string(),
  role: z.string(),
  yearsOfExperience: z.number().int().positive(),
  url: z.url(),
  location: z.string(),
  timezone: z.string(),
  availability: z.object({
    open: z.boolean(),
    label: z.string(),
  }),
  avatar: imageSchema,
  illustration: imageSchema,
  cta: z.object({
    book: z.string(),
    work: z.string(),
  }),
  bio: z.object({
    short: z.string().max(160),
    long: z.string(),
  }),
  email: z.email(),
  bookingUrl: z.url(),
  cvUrl: z.string().optional(),
  socials: z.array(socialSchema),
  nav: z.array(navItemSchema),
  services: z.array(z.object({ title: z.string(), description: z.string(), stack: z.array(z.string()).default([]) })),
  process: z.array(z.object({ title: z.string(), when: z.string(), description: z.string() })).max(5),
  projects: z.array(projectSchema).max(6),
  experience: z.array(experienceSchema),
  skills: z.array(skillGroupSchema),
  assembly: z.object({
    stack: z.string(),
    hint: z.string(),
    project: z.object({ problem: z.string(), solution: z.string(), stack: z.string(), outcome: z.string() }),
    career: z.string(),
    process: z.string(),
  }),
  home: z.object({
    intro: z.string(),
    work: z.object({ title: z.string(), all: z.string() }),
    services: z.object({ title: z.string(), parts: z.string() }),
    about: z.object({ more: z.string() }),
  }),
  contact: z.object({
    prompt: z.tuple([z.string(), z.string()]),
    next: z.string(),
    copy: z.string(),
    copied: z.string(),
  }),
  about: z.object({
    title: z.string(),
    facts: z.object({ based: z.string(), experience: z.string(), status: z.string() }),
    record: z.object({ roles: z.string(), stack: z.string() }),
    process: z.string(),
    cv: z.string(),
    present: z.string(),
  }),
  projectsPage: z.object({
    title: z.string(),
    intro: z.string(),
    labels: z.object({ role: z.string(), year: z.string(), stack: z.string(), outcome: z.string() }),
    pending: z.string(),
    empty: z.object({ title: z.string(), body: z.string() }),
  }),
  footer: z.object({ description: z.string(), build: z.string() }),
  errorPage: z.object({
    title: z.string(),
    body: z.string(),
    retry: z.string(),
    home: z.string(),
  }),
})

export type Site = z.infer<typeof siteSchema>
export type Project = Site["projects"][number]
export type Experience = Site["experience"][number]
export type Layer = (typeof layers)[number]

const placeholderProject = (n: number, slug: string): z.input<typeof projectSchema> => ({
  slug,
  title: `Project ${n} (TODO)`,
  summary: "TODO: one-line summary of what it is and who it's for.",
  year: 2025,
  role: "TODO: e.g. Lead full-stack engineer",
  problem: "TODO: what was broken, slow, or missing — and for whom.",
  solution: "TODO: what you built and the key technical decisions.",
  outcome: "TODO: measurable result (speed, revenue, users, time saved).",
  stack: ["Laravel", "Inertia", "React", "MySQL"],
  links: {},
  cover: { src: `/work/${slug}/cover.png`, alt: `Project ${n} cover` },
  gallery: [],
  featured: true,
  placeholder: true,
})

const cvUrl = "/cv.pdf" // TODO: add public/cv.pdf (links to it stay hidden until it exists)

export const site = siteSchema.parse({
  name: "Jhovanie Flores",
  role: "Senior Software Engineer",
  yearsOfExperience: 4,
  url: "https://jhovanie.dev", // TODO: confirm domain
  location: "TODO: City, Country",
  timezone: "UTC", // TODO: your IANA timezone, e.g. "Europe/London"
  availability: {
    open: true,
    label: "Open to roles & projects",
  },
  avatar: { src: "/images/image_9deddd71.jpg", alt: "Illustrated portrait of Jhovanie Flores" },
  illustration: {
    src: "/images/image_17a079d5.jpg",
    alt: "Illustration of Jhovanie Flores at a desk, laptop screen reading \"Successfully Deployed\"",
  },
  cta: {
    book: "Book a call",
    work: "See the work",
  },
  bio: {
    short: "I build and ship full-stack products, from the database to the deploy.",
    long: "I'm a senior software engineer with 4 years of experience building web products end to end with Laravel, React, and Next.js, backed by MySQL/PostgreSQL and shipped on Docker, Cloudflare, DigitalOcean, and Vercel. I use Claude as part of my daily workflow to move faster without cutting corners.",
  },
  email: "hello@example.com", // TODO
  bookingUrl: "https://cal.com/TODO", // TODO
  cvUrl,
  socials: [
    { label: "GitHub", href: "https://github.com/TODO" },
    { label: "LinkedIn", href: "https://linkedin.com/in/TODO" },
    { label: "X", href: "https://x.com/TODO" },
  ],
  nav: [
    { label: "Work", href: "/projects" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  services: [
    {
      title: "Full-stack web apps",
      description: "Laravel + Inertia + React or Next.js, built from schema to UI.",
      stack: ["Laravel", "Inertia", "React", "Next.js", "Tailwind CSS"],
    },
    {
      title: "APIs & data",
      description: "Clean APIs and well-modelled MySQL/PostgreSQL databases.",
      stack: ["Laravel", "PHP", "MySQL", "PostgreSQL"],
    },
    {
      title: "Deploy & infrastructure",
      description: "Dockerized apps shipped on Vercel, DigitalOcean, and Cloudflare.",
      stack: ["Docker", "Cloudflare", "DigitalOcean", "Vercel"],
    },
    {
      title: "AI-assisted delivery",
      description: "Using Claude to ship faster and add AI features where they help.",
      stack: ["Claude"],
    },
  ],
  // TODO: draft copy — edit to match how you actually work.
  process: [
    { title: "Intro call", when: "Day one", description: "We talk goals, users and constraints. No slides." },
    { title: "Scope & estimate", when: "Week one", description: "A written plan: what ships first, timeline, and cost." },
    { title: "Build & review", when: "Every week", description: "Previews on a live URL, so you see progress early." },
    { title: "Launch & handover", when: "Launch day", description: "Deployed, monitored and documented, ready for traffic." },
  ],
  projects: [
    placeholderProject(1, "project-one"),
    placeholderProject(2, "project-two"),
    placeholderProject(3, "project-three"),
    placeholderProject(4, "project-four"),
  ],
  experience: [
    {
      company: "TODO: Company",
      title: "Senior Software Engineer",
      start: "2024-01", // TODO
      end: "present",
      highlights: ["TODO: highlight with a measurable outcome"],
      stack: ["Laravel", "React", "PostgreSQL"],
    },
    {
      company: "TODO: Company",
      title: "Software Engineer",
      start: "2022-01", // TODO
      end: "2023-12", // TODO
      highlights: ["TODO: highlight with a measurable outcome"],
      stack: ["Laravel", "Inertia", "MySQL"],
    },
  ],
  // `note` lines are draft copy, written from services and bio.long.
  skills: [
    {
      group: "Infra & Cloud",
      items: ["Docker", "Cloudflare", "DigitalOcean", "Vercel"],
      layer: "edge",
      note: "Dockerized apps shipped on Vercel, DigitalOcean, and Cloudflare.",
    },
    {
      group: "Frontend",
      items: ["React", "Next.js", "Inertia", "Tailwind CSS", "TypeScript"],
      layer: "interface",
      note: "Interfaces in React, Next.js or Inertia, typed end to end.",
    },
    {
      group: "Backend",
      items: ["Laravel", "PHP"],
      layer: "api",
      note: "Clean Laravel APIs with the business rules where they belong.",
    },
    {
      group: "Data",
      items: ["MySQL", "PostgreSQL"],
      layer: "data",
      note: "Well-modelled MySQL and PostgreSQL schemas.",
    },
    { group: "AI", items: ["Claude"], note: "Claude in the daily workflow, and AI features where they help." },
  ],
  assembly: {
    stack: "The stack",
    hint: "Scroll to pull it apart. Pick a part to read it.",
    project: { problem: "Problem", solution: "Solution", stack: "Stack", outcome: "Outcome" },
    career: "Career",
    process: "Your project",
  },
  home: {
    intro: "An exploded view of what I ship, from the data model to the deploy.",
    work: { title: "Selected work", all: "All work" },
    services: { title: "What you can hire me for", parts: "parts" },
    about: { more: "More about me" },
  },
  contact: {
    prompt: ["Have something to build?", "Let's talk it through."],
    next: "Book a short intro call, or copy my email and write to me.",
    copy: "Copy email",
    copied: "Copied",
  },
  about: {
    title: "About",
    facts: { based: "Based in", experience: "Experience", status: "Status" },
    record: { roles: "Roles", stack: "Stack" },
    process: "How a project runs",
    cv: "Download CV",
    present: "now",
  },
  projectsPage: {
    title: "Work",
    intro: "Products I've built and shipped end to end: the problem, my role, the stack, and what changed.",
    labels: { role: "Role", year: "Year", stack: "Stack", outcome: "Outcome" },
    pending: "Screenshot coming",
    empty: {
      title: "No case studies yet",
      body: "They're on their way. In the meantime, tell me about your project.",
    },
  },
  footer: { description: "Full-stack software engineer", build: "build" },
  errorPage: {
    title: "Something broke",
    body: "This page hit an error. Try again, or head back to the start.",
    retry: "Try again",
    home: "Back to home",
  },
} satisfies z.input<typeof siteSchema>)
