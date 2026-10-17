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
  icon: z.enum(["github", "linkedin", "x", "mail", "calendar"]),
})

const navItemSchema = z.object({
  label: z.string(),
  icon: z.enum(["home", "projects", "about", "contact"]),
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

/** href: a route ("/about"), a public file ("/cv.pdf"), or an external URL. */
const linkSchema = z.object({
  label: z.string(),
  href: z.string(),
})

/** A section's small pill label and its big title. */
const sectionHeadingSchema = z.object({
  label: z.string(),
  title: z.string(),
})

const skillGroupSchema = z.object({
  group: z.string(),
  items: z.array(z.string()).min(1),
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
  cta: z.object({
    book: z.string(),
    contact: z.string(),
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
  services: z.array(
    z.object({ title: z.string(), description: z.string(), stack: z.array(z.string()).default([]) })
  ),
  process: z.array(z.object({ title: z.string(), description: z.string() })).max(5),
  projects: z.array(projectSchema).max(6),
  experience: z.array(experienceSchema),
  skills: z.array(skillGroupSchema),
  home: z.object({
    heroImage: imageSchema,
    localTimeLabel: z.string(),
    stripLabel: z.string(),
    secondaryCta: z.string(),
    biography: sectionHeadingSchema.extend({
      stats: z.object({ years: z.string(), projects: z.string(), tools: z.string() }),
    }),
    services: sectionHeadingSchema,
    process: sectionHeadingSchema,
    work: sectionHeadingSchema.extend({
      allLabel: z.string(),
      caseStudy: z.string(),
      liveSite: z.string(),
      previous: z.string(),
      next: z.string(),
      roleLabel: z.string(),
      yearLabel: z.string(),
      max: z.number().int().min(1).max(6),
    }),
    experience: sectionHeadingSchema.extend({ present: z.string() }),
    contact: z.object({
      label: z.string(),
      title: z.string(),
      body: z.string(),
      recruiters: linkSchema,
    }),
  }),
  footer: z.object({
    contactTitle: z.string(),
    builtWith: z.string(),
  }),
  projectsPage: z.object({
    label: z.string(),
    title: z.string(),
    intro: z.string(),
    filterLabel: z.string(),
    all: z.string(),
    viewLabel: z.string(),
    views: z.object({ index: z.string(), grid: z.string() }),
    noMatch: z.object({ title: z.string(), body: z.string(), clear: z.string() }),
    empty: z.object({ title: z.string(), body: z.string() }),
  }),
  ui: z.object({
    placeholder: z.string(),
    stack: z.string(),
    email: z.string(),
    basedIn: z.string(),
    copyEmail: z.string(),
    copied: z.string(),
  }),
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

// Referenced in more than one place below.
const bookingUrl = "https://cal.com/TODO" // TODO
const linkedinUrl = "https://linkedin.com/in/TODO" // TODO
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
  cta: {
    book: "Book a call",
    contact: "Contact me",
  },
  bio: {
    short: "I build and ship full-stack products, from the database to the deploy.",
    long: "I'm a senior software engineer with 4 years of experience building web products end to end with Laravel, React, and Next.js, backed by MySQL/PostgreSQL and shipped on Docker, Cloudflare, DigitalOcean, and Vercel. I use Claude as part of my daily workflow to move faster without cutting corners.",
  },
  email: "hello@example.com", // TODO
  bookingUrl,
  cvUrl,
  socials: [
    { label: "GitHub", href: "https://github.com/TODO", icon: "github" },
    { label: "LinkedIn", href: linkedinUrl, icon: "linkedin" },
    { label: "X", href: "https://x.com/TODO", icon: "x" },
  ],
  nav: [
    { label: "Home", href: "/", icon: "home" },
    { label: "Projects", href: "/projects", icon: "projects" },
    { label: "About", href: "/about", icon: "about" },
    { label: "Contact", href: "/contact", icon: "contact" },
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
    { title: "Intro call", description: "We talk goals, users and constraints. No slides." },
    { title: "Scope & estimate", description: "A written plan: what ships first, timeline, and cost." },
    { title: "Build & review", description: "Weekly previews on a live URL, so you see progress early." },
    { title: "Launch & handover", description: "Deployed, monitored and documented, ready for traffic." },
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
  skills: [
    { group: "Backend", items: ["Laravel", "PHP"] },
    { group: "Frontend", items: ["React", "Next.js", "Inertia", "Tailwind CSS", "TypeScript"] },
    { group: "Data", items: ["MySQL", "PostgreSQL"] },
    { group: "Infra & Cloud", items: ["Docker", "Cloudflare", "DigitalOcean", "Vercel"] },
    { group: "AI", items: ["Claude"] },
  ],
  home: {
    heroImage: {
      src: "/images/image_17a079d5.jpg",
      alt: "Illustration of Jhovanie Flores at a desk, laptop screen reading \"Successfully Deployed\"",
    },
    localTimeLabel: "local time",
    stripLabel: "Tech stack",
    secondaryCta: "View projects",
    biography: {
      label: "Biography",
      title: "About me",
      stats: { years: "Years experience", projects: "Projects shipped", tools: "Tools in the stack" },
    },
    services: { label: "Services", title: "What I build" },
    process: { label: "Process", title: "How I work" },
    work: {
      label: "Featured work",
      title: "Selected work",
      allLabel: "All projects",
      caseStudy: "View case study",
      liveSite: "Live site",
      previous: "Previous project",
      next: "Next project",
      roleLabel: "Role",
      yearLabel: "Year",
      max: 4,
    },
    experience: { label: "Résumé", title: "Where I've worked", present: "Present" },
    contact: {
      label: "Contact",
      title: "Have a project in mind? Let's get to work.",
      body: "Tell me what you're building. I'll tell you how I'd ship it.",
      recruiters: { label: "Hiring? See my experience", href: "/about" },
    },
  },
  footer: {
    contactTitle: "Contact",
    builtWith: "Built with Next.js & Tailwind CSS, deployed on Vercel.",
  },
  projectsPage: {
    label: "Work",
    title: "Projects",
    intro: "Products I've built and shipped end to end: the problem, my role, the stack, and what changed.",
    filterLabel: "Filter by stack",
    all: "All",
    viewLabel: "View",
    views: { index: "Index", grid: "Grid" },
    noMatch: {
      title: "No stops on this line yet",
      body: "None of these projects use that stack yet.",
      clear: "Show all projects",
    },
    empty: {
      title: "No projects on the line yet",
      body: "Case studies are on their way. In the meantime, tell me about yours.",
    },
  },
  ui: {
    placeholder: "Placeholder",
    stack: "Stack",
    email: "Email",
    basedIn: "Based in",
    copyEmail: "Copy email",
    copied: "Copied",
  },
  errorPage: {
    title: "Signal failure",
    body: "Something on this line stopped working. Try again, or head back to the start.",
    retry: "Try again",
    home: "Back to Home",
  },
} satisfies z.input<typeof siteSchema>)
