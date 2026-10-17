# PRODUCT.md — jhovanie.dev

Personal portfolio for **Jhovanie Flores**, Senior Software Engineer (4 years).
All site content lives in [`content/site.ts`](content/site.ts), validated by a Zod schema. Components read from it and never hardcode copy.

---

## 1. Audience

Two audiences, equal weight:

| Audience | What they need in < 30 seconds | What convinces them |
| --- | --- | --- |
| **Recruiters / hiring managers** | Role, seniority, stack, location/availability | Experience timeline, real shipped products, clear ownership ("I led…", "I built…") |
| **Clients (freelance / contract)** | Can this person build *my* thing, reliably? | Case studies with problem → solution → outcome, screenshots, end-to-end delivery (code → infra → deploy) |

The hero speaks to both. Below it, two quiet paths split the visitor: **"Hiring?"** and **"Have a project?"**

## 2. Goal

**Primary action: Book a call** (a 15–30 min intro via a scheduler link).

- Primary CTA, "Book a call", appears in the hero, the sticky nav, the end of every case study, and the footer.
- Secondary CTA: "View work" scrolls to the projects.
- Tertiary: email (copy-to-clipboard), GitHub, LinkedIn, CV download.

How we'll measure it: clicks on "Book a call", meetings booked, and case-study views.

## 3. Tone & visual direction

**Calm and confident, with a few playful touches.** The site should feel like a premium product, not a template.

- **Voice:** short, plain, first-person sentences. No buzzwords and no "passionate rockstar ninja". Let outcomes speak. Example: *"I build and ship full-stack products, from the database to the deploy."*
- **Visual:** product-grade polish in the vein of Linear, Vercel, and rauno.me. Lots of whitespace, one accent color, crisp type, a dark-first theme with a light mode.
- **Motion (via `motion`):** subtle and purposeful. Fade/slide on scroll, smooth hover states, and a layout animation on the project cards. Respect `prefers-reduced-motion`.
- **Playful touches (small, optional, never in the way):**
  - Cursor-following spotlight or glow on project cards
  - ⌘K / Ctrl+K command menu (navigate, copy email, toggle theme, book a call)
  - A live "local time" next to the location
  - Copy-email button with a satisfying confirmation micro-animation
  - A tiny easter egg (e.g. Konami code or a hidden `console.log` hello for devs)

## 4. Pages

A persistent **app shell** wraps every page: a fixed left sidebar on desktop (≥ 1024px) and a compact top bar with a menu sheet on smaller screens. Pages animate between each other with view transitions while the shell stays still.

| Route | Purpose |
| --- | --- |
| `/` | Home: intro and 2–3 featured projects |
| `/projects` | Grid of all projects, each linking to its case study |
| `/projects/[slug]` | Case study per project, statically generated from `site.projects` |
| `/about` | Story, experience timeline, skills |
| `/contact` | Book a call, email, socials |
| `not-found` | On-brand 404 with a link home (one playful line) |

## 5. Content per page

### Shell (every page)

- **Sidebar header:** large avatar, name, role (centered)
- **Socials:** GitHub, LinkedIn, X, email as icon buttons with tooltips
- **CTAs:** Book a call (primary) and Contact me, on every page
- **Nav:** `site.nav` as real routes (Home, Projects, About, Contact) with icons, drawn as stations on the route line
- **Footer:** theme toggle

### `/` Home

1. **Hero card:** availability, local time, name, role and location, one-line bio, Book a call + View projects, illustration
2. **Logo strip:** the tech stack as large monochrome logos, slowly scrolling
3. **Biography:** `site.bio.long` as a large statement, plus stat cards derived from content (years, projects, tools)
4. **Selected work:** featured projects one at a time (role, year, stack, case study link) with previous / next
5. **Services:** numbered rows; one opens at a time to show description and stack
6. **Process:** 4 fanned cards (`site.process`)
7. **Experience:** timeline cards (`site.experience`), current role lit
8. **Contact:** "Have a project in mind?" pitch with Book a call, and an email / location card
9. **Footer card (every page):** portrait, name, role, socials, location, email

Not included until real content exists: pricing, testimonials, FAQ, client logos.

### `/projects`

1. **Header card:** "Projects", one-line intro, and a line legend: a chip per project (code + title, in its line colour) that jumps to its card
2. **Grid:** every project card in a wide / half / half rhythm (a lone last half card goes wide)
3. **Empty state** (no projects in `site.ts`): a dashed card with a short note and Book a call

### `/projects/[slug]` Case study

1. Title, one-line summary, year, **my role**, live link and repo link (if public)
2. Cover image (large), morphing from the card thumbnail
3. **Problem:** what was broken, slow, or missing, and for whom
4. **Solution:** what I built and the key technical decisions
5. **Outcome:** measurable results where possible (speed, revenue, users, time saved)
6. **Stack:** tags
7. **Gallery:** screenshots with captions
8. Next / previous project, plus a **Book a call** CTA

### `/about`

1. Story: `site.bio.long`, human and short
2. **Experience:** timeline of roles (`site.experience`) with company, title, dates, 2–3 highlights each, and stack
3. **Skills:** grouped (`site.skills`): Backend, Frontend, Data, Infra & Cloud, AI
4. CV download

### `/contact`

"Let's build something." **Book a call** (primary), copy email, socials, location and timezone.

### Metadata / SEO

- Title: "Jhovanie Flores · Senior Software Engineer"
- Per-project OG titles, descriptions, and images generated from `site.ts`
- `sitemap.xml` and `robots.txt` generated from the routes and projects

## 6. Content checklist (to fill in `content/site.ts`)

- [ ] Email
- [ ] Booking link (Cal.com / Calendly)
- [ ] GitHub, LinkedIn (and optionally X)
- [ ] Location and timezone
- [ ] CV PDF in `public/cv.pdf`
- [ ] Experience entries (companies, dates, highlights)
- [ ] 3–6 real projects: title, problem, role, solution, outcome, stack, links, and images in `public/work/<slug>/`

## 7. Non-goals (for now)

- No blog/CMS. All content is code in `site.ts`.
- No contact form backend. Booking link and email cover it.
- No analytics beyond Vercel Analytics.
