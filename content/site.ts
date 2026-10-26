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

const factSchema = z.object({ value: z.string(), note: z.string() })

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
    short: z.string(),
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
    z.object({
      title: z.string(),
      /** Poster name: short enough for one line at display size. */
      short: z.string().max(12),
      description: z.string(),
      stack: z.array(z.string()).default([]),
    })
  ),
  process: z.array(z.object({ title: z.string(), when: z.string(), description: z.string() })).max(5),
  projects: z.array(projectSchema).max(6),
  experience: z.array(experienceSchema),
  skills: z.array(skillGroupSchema),
  home: z.object({
    heroImage: imageSchema,
    localTimeLabel: z.string(),
    secondaryCta: z.string(),
    ticket: z.object({ status: z.string(), time: z.string(), basedIn: z.string() }),
    intro: z.object({ title: z.string(), body: z.string(), years: z.string(), stack: factSchema }),
    work: z.object({
      title: z.string(),
      allLabel: z.string(),
      caseStudy: z.string(),
      max: z.number().int().min(1).max(6),
    }),
    services: z.object({ title: z.string(), body: z.string() }),
    process: z.object({ title: z.string(), body: z.string(), result: factSchema }),
    letter: z.object({ title: z.string(), paragraphs: z.array(z.string()).min(1).max(5) }),
    contact: z.object({
      title: z.string(),
      body: z.string(),
      image: imageSchema,
      recruiters: linkSchema,
    }),
  }),
  about: z.object({
    title: z.string(),
    intro: z.string(),
    experienceTitle: z.string(),
    skillsTitle: z.string(),
    cv: z.string(),
    present: z.string(),
  }),
  contactPage: z.object({
    title: z.string(),
    intro: z.string(),
    elsewhere: z.string(),
  }),
  footer: z.object({
    title: z.string(),
    message: z.string(),
    build: z.string(),
  }),
  /** Found pictures: credited in the footer, never presented as Jhovanie's own. */
  credits: z.array(linkSchema),
  projectsPage: z.object({
    title: z.string(),
    intro: z.string(),
    count: z.string(),
    labels: z.object({ role: z.string(), year: z.string(), stack: z.string() }),
    view: z.string(),
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
    short: "Available",
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
      short: "Web apps",
      description: "Laravel + Inertia + React or Next.js, built from schema to UI.",
      stack: ["Laravel", "Inertia", "React", "Next.js", "Tailwind CSS"],
    },
    {
      title: "APIs & data",
      short: "APIs & data",
      description: "Clean APIs and well-modelled MySQL/PostgreSQL databases.",
      stack: ["Laravel", "PHP", "MySQL", "PostgreSQL"],
    },
    {
      title: "Deploy & infrastructure",
      short: "Deploy",
      description: "Dockerized apps shipped on Vercel, DigitalOcean, and Cloudflare.",
      stack: ["Docker", "Cloudflare", "DigitalOcean", "Vercel"],
    },
    {
      title: "AI-assisted delivery",
      short: "AI delivery",
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
    secondaryCta: "View projects",
    ticket: { status: "Status", time: "Local time", basedIn: "Based in" },
    // TODO: draft copy, written from bio.long. Edit to taste.
    intro: {
      title: "From schema to deploy",
      body: "Four years of building web products end to end: the data model, the API, the interface, and the pipeline that ships them.",
      years: "building and shipping web products",
      stack: { value: "Laravel + Next.js", note: "my main stack, on MySQL and PostgreSQL" },
    },
    work: {
      title: "Selected work",
      allLabel: "All projects",
      caseStudy: "View case study",
      max: 4,
    },
    services: {
      title: "What I build",
      body: "Four stops on one line. Hire me for one, or ride it end to end.",
    },
    process: {
      title: "How a project runs",
      body: "No mystery between the first call and launch. You see the plan in writing and the work on a live URL every week.",
      result: { value: "A deployed, documented product", note: "You get" },
    },
    // TODO: draft copy. The two paths from PRODUCT.md: hiring and projects.
    letter: {
      title: "Hi, I'm Jhovanie",
      paragraphs: [
        "I'm a senior software engineer with 4 years of experience building web products end to end with Laravel, React, and Next.js, backed by MySQL/PostgreSQL and shipped on Docker, Cloudflare, DigitalOcean, and Vercel.",
        "I use Claude as part of my daily workflow to move faster without cutting corners.",
        "If you're hiring, my roles and stack are on the About page. If you have a project, tell me what you're building and I'll tell you how I'd ship it.",
      ],
    },
    contact: {
      title: "Have a project in mind?",
      body: "Tell me what you're building. I'll tell you how I'd ship it.",
      image: {
        src: "/images/station-platform.jpg",
        alt: "A subway platform in black and white, seen across the tracks between steel columns",
      },
      recruiters: { label: "Hiring? See my experience", href: "/about" },
    },
  },
  about: {
    title: "About Jhovanie",
    intro: "Senior software engineer. I build and ship full-stack products, from the database to the deploy.",
    experienceTitle: "Where I've worked",
    skillsTitle: "What I work with",
    cv: "Download my CV",
    present: "Present",
  },
  contactPage: {
    title: "Let's build something",
    intro: "Book a short intro call, or email me. Tell me what you're building and I'll tell you how I'd ship it.",
    elsewhere: "Elsewhere",
  },
  footer: {
    title: "Thanks for reading",
    message: "If something here fits what you need, I'd like to hear about it.",
    build: "This build",
  },
  credits: [
    { label: "Platform photograph by Matthew Wiebe (Unsplash)", href: "https://unsplash.com/photos/azkWKhyr54U" },
  ],
  projectsPage: {
    title: "Projects",
    intro: "Products I've built and shipped end to end: the problem, my role, the stack, and what changed.",
    count: "projects",
    labels: { role: "Role", year: "Year", stack: "Stack" },
    view: "View case study",
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
