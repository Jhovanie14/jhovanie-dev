import { z } from "zod"

/**
 * Single source of truth for all site content.
 * Values marked TODO are placeholders — replace them before launch.
 */

const imageSchema = z.object({
  src: z.string().startsWith("/"),
  alt: z.string().min(1),
})

/** The folders on the monitor, in order. A folder shows once it holds a project. */
export const CATEGORIES = ["Web apps", "Landing pages", "Automation"] as const

const projectSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, "slug must be kebab-case"),
  title: z.string().min(1),
  category: z.enum(CATEGORIES),
  summary: z.string().max(140),
  year: z.number().int().min(2000),
  /** 1–12, shown with the year in the case study. */
  month: z.number().int().min(1).max(12).optional(),
  role: z.string(),
  problem: z.string(),
  solution: z.string(),
  outcome: z.string(),
  stack: z.array(z.string()).min(1),
  links: z.object({
    live: z.url().optional(),
    repo: z.url().optional(),
  }),
  /** Shown on the monitor; put the file at public/work/<slug>/cover.png. */
  cover: imageSchema,
  /** More screenshots for the monitor to play, in order (full-page shots scroll). */
  gallery: z.array(imageSchema).default([]),
})

const experienceSchema = z.object({
  company: z.string(),
  title: z.string(),
  start: z.string().regex(/^\d{4}-\d{2}$/, "use YYYY-MM"),
  end: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .or(z.literal("present")),
  highlights: z.array(z.string()).max(4),
  stack: z.array(z.string()).default([]),
})

export const siteSchema = z.object({
  name: z.string(),
  role: z.string(),
  yearsOfExperience: z.number().int().positive(),
  url: z.url(),
  location: z.string(),
  availability: z.string(),
  /** The sentence under the name. */
  intro: z.string(),
  avatar: imageSchema,
  illustration: imageSchema,
  email: z.email(),
  cvUrl: z.string().optional(),
  socials: z.array(z.object({ label: z.string(), href: z.url() })),
  /** Six to a page on the monitor; more pages slide in. */
  projects: z.array(projectSchema).max(18),
  experience: z.array(experienceSchema),
  skills: z.array(z.object({ group: z.string(), items: z.array(z.string()).min(1) })),
  contact: z.object({ title: z.string(), body: z.string() }),
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

/** A role's years, e.g. "2023–2024", "2026–now", or just "2025" when it started and ended that year. */
export function yearSpan(start: string, end: string) {
  const from = start.slice(0, 4)
  const to = end === "present" ? "now" : end.slice(0, 4)
  return from === to ? from : `${from}–${to}`
}

const years = 4

export const site = siteSchema.parse({
  name: "Jhovanie Flores",
  role: "Full-Stack Software Engineer",
  yearsOfExperience: years,
  url: "https://jhovanie.dev",
  location: "Philippines",
  availability: "Open to full-time roles",
  intro: `${years} years building and shipping full-stack products with Laravel, React and Next.js.`,
  avatar: { src: "/images/image_9deddd71.jpg", alt: "Illustrated portrait of Jhovanie Flores" },
  illustration: {
    src: "/images/image_17a079d5.jpg",
    alt: "Illustration of Jhovanie Flores at a desk, laptop screen reading \"Successfully Deployed\"",
  },
  email: "flores.jhovanie14@gmail.com",
  cvUrl: "/cv.pdf", // TODO: add public/cv.pdf (the "Download CV" button appears once it exists)
  socials: [
    { label: "GitHub", href: "https://github.com/jhovanie14" },
    { label: "WhatsApp", href: "https://wa.me/639192903551" },
  ],
  // Newest first.
  projects: [
    {
      slug: "aesthetic-training-hub",
      title: "Aesthetic Training Hub",
      summary: "A UK marketplace where vetted aesthetics trainers list courses and students find, enquire and book.",
      category: "Web apps",
      year: 2026,
      month: 8,
      role: "Solo full-stack developer · now maintaining",
      problem:
        "Students looking for aesthetics training had no way to tell which trainers were insured and qualified. Directories listed anyone, and reviews couldn't be trusted.",
      solution:
        "A three-role marketplace (student, trainer, admin). Every trainer is checked by a person against the GMC, NMC and GDC registers before going live. Reviews come only from real bookings. Postgres row-level security keeps each role to its own data, PostGIS powers the town or postcode search, and Stripe handles trainer subscriptions and commission. It's mobile-first, since 70–80% of students browse on a phone.",
      outcome:
        "Live at aesthetictraininghub.co.uk with 70+ pages shipped. I still run and maintain it.",
      stack: ["Next.js 16", "Supabase", "Postgres + RLS", "Drizzle", "Stripe", "Resend", "PostGIS", "Playwright"],
      links: { live: "https://aesthetictraininghub.co.uk" },
      cover: {
        src: "/images/aesthetic-training-hub-showcase/ath-cover.png",
        alt: "Aesthetic Training Hub homepage on desktop and mobile",
      },
      gallery: [
        {
          src: "/images/aesthetic-training-hub-showcase/ath-screens.png",
          alt: "Mobile flow: search, verified trainers, profile and enquiry",
        },
        {
          src: "/images/aesthetic-training-hub-showcase/screenshots/desk-pricing.png",
          alt: "Trainer pricing page with Standard and Premium plans",
        },
        {
          src: "/images/aesthetic-training-hub-showcase/screenshots/mob-home.png",
          alt: "Mobile homepage with specialism and postcode search",
        },
        {
          src: "/images/aesthetic-training-hub-showcase/screenshots/mob-profile.png",
          alt: "Mobile trainer profile with verified badge, reviews and price",
        },
      ],
    },
    {
      slug: "megestic",
      title: "Megestic",
      summary: "A phone system for a group of local brands: calls, texts and voicemail in one place, with an AI receptionist as backup.",
      category: "Web apps",
      year: 2026,
      month: 6,
      role: "Solo full-stack developer",
      problem:
        "A group of local brands, each with its own phone number, losing calls whenever nobody on the team was free, with calls, texts and voicemail spread across separate places.",
      solution:
        "The Hourglass web panel, a Chrome extension and the phone app share one system. Telnyx sends each call to a voice webhook that knows which brand the number belongs to. Every reachable agent rings at once: in the browser over WebRTC, in the Chrome call panel, or on their phone, woken by an FCM push. If nobody answers, that brand's AI receptionist picks up in the brand's name, takes the details, and can transfer to a person who comes online. Every call is recorded on two channels and transcribed. A Slack note lands in the brand's channel with why they called, what the AI did and anything at risk. Agents log outcomes and follow-ups, and a signed, read-only events API lets the group's other AI system follow every call, text and voicemail.",
      outcome: "In use across the group's brands on web, Chrome and mobile: Chrome extension at v3.2, covered by 445 automated tests.", // TODO: confirm, add a number (calls handled, missed calls saved)
      stack: [
        "Next.js 16",
        "React 19",
        "Supabase (Postgres, Auth, RLS, Realtime, Storage)",
        "Telnyx (Voice API, WebRTC, SMS, AI Assistant)",
        "Chrome Extension MV3",
        "Firebase Cloud Messaging",
        "Slack",
        "Tailwind v4",
        "shadcn/ui",
        "Vitest",
      ],
      links: {},
      cover: {
        src: "/images/megestic-showcase/mg-cover.png",
        alt: "Megestic dashboard with the Chrome call panel, shown with demo data",
      },
      gallery: [
        {
          src: "/images/megestic-showcase/mg-screens.png",
          alt: "Call history with the AI receptionist's transcript, and the Chrome call panel's texts and recent calls",
        },
        {
          src: "/images/megestic-showcase/mg-system.png",
          alt: "How a call is answered: ring everyone, then the AI receptionist, then the hand-off",
        },
      ],
    },
    {
      slug: "bucket-baddie",
      title: "Bucket Baddie",
      summary: "Online ordering for a Houston wing spot, wired into Square: pay online, the ticket hits the kitchen, stock counts itself.",
      category: "Web apps",
      year: 2026,
      month: 5,
      role: "Solo full-stack developer",
      problem:
        "A pick-up wing spot taking orders through Square, with the website, the kitchen's POS and the stock room all kept in step by hand, and no way for customers to see where their order was.",
      solution:
        "Checkout re-prices the cart on the server, checks coupons and enforces store hours, then charges the card through Square and creates the kitchen's pick-up ticket on the POS. When staff move the ticket, a signed Square webhook syncs the status back, and the customer's tracking page updates live over Reverb WebSockets, re-checking if a broadcast is missed. Every Square sale, from the website or the till, arrives as an idempotent Horizon job. Recipes turn \"12 wings, Garlic Drip\" into exact ingredient amounts, and a stock ledger records every movement, so the owner sees what was used, wasted and needs restocking from one dashboard.",
      outcome: "Live at bucketbaddie.com: 45 screens across the site and admin, covered by 357 automated tests.",
      stack: ["Laravel 13", "PHP 8.5", "Vue 3", "Inertia v3 (SSR)", "Laravel Reverb", "Horizon", "Square API", "Tailwind v4", "Pest", "Docker", "DigitalOcean"],
      links: { live: "https://bucketbaddie.com" },
      cover: {
        src: "/images/bucket-baddie-showcase/bb-cover.png",
        alt: "Bucket Baddie homepage on desktop and mobile",
      },
      gallery: [
        {
          src: "/images/bucket-baddie-showcase/bb-screens.png",
          alt: "Mobile flow: build an order, filter sauces by heat, the Ghost Mode challenge",
        },
        {
          src: "/images/bucket-baddie-showcase/bb-system.png",
          alt: "How one order keeps the website, the Square POS and the stock count in sync",
        },
      ],
    },
    {
      slug: "the-launch-pad",
      title: "The Launch Pad",
      summary: "The full digital side of a Houston car wash: bookings, memberships, 24/7 bays, a store, and the console that runs the day.",
      category: "Web apps",
      year: 2025,
      month: 11,
      role: "Solo full-stack developer",
      problem:
        "A car wash with three businesses under one roof (24/7 self-service bays, booked detailing and an unlimited membership) plus a product range, and nothing online tying them together for drivers, staff or fleet customers.",
      solution:
        "One platform for three audiences: drivers, staff and fleet. Stripe handles one-off bookings, monthly memberships and the store's cart checkout, with pickup or local delivery. Customers track bookings and orders in their own dashboard, and an admin console handles the day's schedule, fulfilment and refunds. Supabase auth and row-level security keep each audience to its own data. The store gets its own black-and-gold theme scoped to one route, while the rest of the site stays light.",
      outcome: "Live at thelaunchpadwash.com: 67 pages and 51 API routes.",
      stack: ["Next.js 16", "React 19", "TypeScript", "Supabase (PostgreSQL, Auth, RLS)", "Stripe", "Resend", "Tailwind v4", "shadcn/ui", "Motion", "Vitest", "Vercel", "Cloudflare"],
      links: { live: "https://thelaunchpadwash.com" },
      cover: {
        src: "/images/the-launch-pad-showcase/tlp-cover.png",
        alt: "The Launch Pad homepage on desktop and mobile",
      },
      gallery: [
        {
          src: "/images/the-launch-pad-showcase/tlp-screens.png",
          alt: "Mobile flow: choose a service, book a detail, join the unlimited membership",
        },
        {
          src: "/images/the-launch-pad-showcase/tlp-store.png",
          alt: "The Pro Series storefront in its own black-and-gold theme",
        },
      ],
    },
  ],
  experience: [
    {
      company: "Equals3",
      title: "Full-Stack Web Developer",
      start: "2026-07",
      end: "present",
      highlights: [
        "Built and maintain Aesthetic Training Hub, a live UK marketplace for vetted aesthetics trainers, across 70+ pages.",
        "Three-role system with Row Level Security, register-checked trainers and reviews only from real bookings.",
      ],
      stack: ["Next.js", "Supabase", "Stripe", "PostGIS", "Playwright"],
    },
    {
      company: "Hourglass Investment LLC",
      title: "Full-Stack Web Developer",
      start: "2025-08",
      end: "2026-06",
      highlights: [
        "Built Hourglass Mobile, the group's phone system: WebRTC calling, SMS, voicemail and an AI receptionist (445 tests).",
        "Built Bucket Baddie's ordering platform on the full Square ecosystem, with live tracking and inventory (357 tests).",
        "Solo-built The Launchpad Wash: bookings, Stripe memberships and a store (67 pages, 51 API routes).",
      ],
      stack: ["Next.js", "Supabase", "Telnyx", "Laravel", "Vue", "Square", "Stripe"],
    },
    {
      company: "Aero IDX",
      title: "Software Developer",
      start: "2025-02",
      end: "2025-06",
      highlights: ["Shipped backend and frontend modules with Laravel, Vue, Inertia and Tailwind in an agile team."],
      stack: ["Laravel", "Vue", "Inertia"],
    },
    {
      company: "University of Mindanao",
      title: "College Instructor",
      start: "2024-07",
      end: "2024-12",
      highlights: ["Taught PHP, Laravel, MySQL and Python, and mentored students through real-world capstone projects."],
      stack: ["PHP", "Laravel", "MySQL"],
    },
    {
      company: "RAG IT Solution",
      title: "Junior Software Developer",
      start: "2023-05",
      end: "2024-06",
      highlights: ["Built and maintained client websites with Vue and REST APIs, and worked on Laravel Passport authentication."],
      stack: ["Vue", "Laravel"],
    },
  ],
  // One book on the shelf per item.
  skills: [
    { group: "Frontend", items: ["React", "Next.js", "Vue", "TypeScript", "Tailwind CSS"] },
    { group: "Backend", items: ["Laravel", "PHP", "Inertia", "Reverb", "Horizon"] },
    { group: "Data", items: ["PostgreSQL", "Supabase", "MySQL"] },
    { group: "Integrations", items: ["Stripe", "Square", "Telnyx", "WebRTC"] },
    { group: "Testing", items: ["Pest", "Vitest", "Playwright"] },
    { group: "Infra", items: ["Docker", "Vercel", "Cloudflare", "DigitalOcean"] },
    { group: "AI", items: ["Claude"] },
  ],
  contact: {
    title: "Hiring?",
    body: "I'm looking for a full-time role. I'd like to hear about yours.",
  },
  errorPage: {
    title: "Something broke",
    body: "This page hit an error. Try again, or head back to the start.",
    retry: "Try again",
    home: "Back to home",
  },
} satisfies z.input<typeof siteSchema>)
