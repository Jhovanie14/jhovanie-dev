# PRODUCT.md — jhovanie.dev

Personal portfolio for **Jhovanie Flores**, Full-Stack Software Engineer (nearly 4 years), based in Davao City, Philippines (GMT+8).
All site content lives in [`content/site.ts`](content/site.ts), validated by a Zod schema. Components read from it and never hardcode copy.

## Audience

**Employers hiring for a full-time role**: recruiters, hiring managers and engineering leads. Not freelance clients.

| What they need in under 30 seconds | What convinces them |
| --- | --- |
| Name, role, availability, location and time zone | Real, live products built solo, end to end |
| The stack, at a glance | Case studies: problem, solution, stack, outcome, with screenshots |
| A way to get the CV and make contact | Engineering depth: tests, real-time systems, payments, telephony |

## Goal

**Primary action: contact** (email, or WhatsApp on +63 919 290 3551). **Secondary: download the CV** (`public/cv.pdf`).

- "Contact me" sits in the header and the intro; the contact panel has the email with copy-to-clipboard, GitHub, WhatsApp and the CV.
- "Download CV" appears in the intro and contact panels whenever `public/cv.pdf` exists.
- There is no LinkedIn link until the profile is up to date.

## Positioning

- A premium, memorable first impression that a recruiter remembers: the site *is* a 3D room, Jhovanie's desk at night.
- Bold motion and interaction lead the first screen; quiet, template-looking layouts are out.
- Every fact is real. Projects show their own screenshots; no stock imagery or invented numbers.
- Mobile matters as much as desktop: recruiters often open links on a phone.

## Content

| Section | Source in `site.ts` | Notes |
| --- | --- | --- |
| Intro | `name`, `role`, `intro`, `availability` | "Open to full-time roles" |
| Work | `projects` (newest first, up to 18), each with a `category` from `CATEGORIES` | Folders by category on the monitor (Web apps, Landing pages, Automation); six cards per page; showcase images in `public/images/<project>-showcase/` |
| Skills | `skills` | One book per item on the shelf; grouped in the panel |
| Experience | `experience` | Mirrors the CV |
| Contact | `email`, `socials`, `cvUrl`, `contact` | |

Current projects: Aesthetic Training Hub (Equals3), Megestic / Hourglass Mobile, Bucket Baddie and The Launch Pad (all Hourglass Investment LLC). More are coming once their showcase images are ready.

## Tone

Plain, specific and confident. Say what was built and how, in the first person on the CV and neutrally on the site. No hype words, no "passionate", no emoji.
