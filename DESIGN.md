# DESIGN.md — "The Line"

The site is a **transit route map** of Jhovanie's work. Pages are **stations**, the nav is the **route line**, and the active page is marked by a **train marker** that glides along it. The map is quiet: it orients the visitor and never performs. Product truth and content live in [`PRODUCT.md`](PRODUCT.md) and [`content/site.ts`](content/site.ts); this file owns the visual system.

Every colour, font, radius, duration and easing below is a token in [`app/globals.css`](app/globals.css). Components use tokens only (Tailwind utilities generated from them), never raw hex/oklch values.

---

## 1. Scene → theme

A recruiter skimming between calls, or a founder reading at night after work: screens, mixed light, often late. **Dark first** ("night map", the default), with a **light** "day map" one keypress away (`D`, or the toggle in the sidebar footer).

## 2. Colour

Strategy: **restrained**. The background is map ink, text is white enamel, and colour comes only from the **lines**. Line colours are **strokes and fills** (the route line, station discs, the marker, tags), and never body text.

### Surface tokens

| Token | Night map (`.dark`, default) | Day map (`:root`) | Use |
| --- | --- | --- | --- |
| `--background` | `oklch(0.13 0.02 264)` | `oklch(0.975 0.004 260)` | Page ground (deep navy-black) |
| `--foreground` | `oklch(0.955 0.005 250)` | `oklch(0.21 0.02 255)` | Text |
| `--card` | `oklch(0.175 0.028 264)` | `oklch(1 0 0)` | Raised surfaces (navy) |
| `--popover` | `oklch(0.21 0.014 255)` | `oklch(1 0 0)` | Tooltips, sheet |
| `--muted` / `--secondary` | `oklch(0.24 0.014 255)` | `oklch(0.955 0.005 250)` | Quiet fills |
| `--muted-foreground` | `oklch(0.72 0.014 255)` | `oklch(0.5 0.02 255)` | Secondary text (≥ 4.5:1) |
| `--accent` | `oklch(0.25 0.015 255)` | `oklch(0.95 0.006 250)` | Hover fills |
| `--border` | `oklch(1 0 0 / 9%)` | `oklch(0.9 0.006 250)` | Hairlines |
| `--primary` | `oklch(0.76 0.16 58)` | `oklch(0.7 0.17 52)` | Primary action (signal orange) |
| `--primary-foreground` | `oklch(0.18 0.02 255)` | `oklch(0.18 0.02 255)` | Text on primary (dark ink in both themes) |
| `--ring` | = primary | = primary | Focus ring |
| `--sidebar` | `oklch(0.175 0.028 264)` | `oklch(1 0 0)` | Floating shell panel, same as cards |
| `--destructive` | `oklch(0.7 0.19 25)` | `oklch(0.577 0.245 27.3)` | Errors only |
| `--warning` | `oklch(0.83 0.15 85)` | `oklch(0.75 0.16 75)` | **Amber is reserved for caution** |

### Line tokens

Each project is assigned one line colour (cycle in order). Line 1 is also the site's own route line.

| Token | Night | Day | Name |
| --- | --- | --- | --- |
| `--line-1` | `oklch(0.76 0.16 58)` | `oklch(0.68 0.17 50)` | Signal orange |
| `--line-2` | `oklch(0.74 0.15 155)` | `oklch(0.62 0.15 155)` | Interchange green |
| `--line-3` | `oklch(0.7 0.13 245)` | `oklch(0.56 0.15 250)` | Platform blue |
| `--line-4` | `oklch(0.74 0.13 350)` | `oklch(0.62 0.17 355)` | Express pink |

Tailwind: `bg-line-1`, `border-line-2`, `text-warning`, …

**Paper** (`paper` utility): the printed pieces of the line (the hero ticket, the contact ticket) invert the theme: enamel paper with ink text on the night map, ink paper on the day map. Secondary text on paper uses `--paper-muted`.

**Never:** gradients (a flat scrim over a photograph is the one exception), glows, coloured halos, glass panels, gradient text, shadows on things at rest. Page content separates surfaces by a tone step (`bg-card`, `bg-muted`) or space, never hairlines or 1px outlined boxes. The sidebar shell keeps its own border and separator.

## 3. Type

| Role | Face | Token |
| --- | --- | --- |
| Everything | **Overpass** (variable 100–900, derived from US highway signage) | `--font-sans`, `--font-heading` |
| Real code only (the build receipt) | **Overpass Mono** | `--font-mono` |

Five steps, defined in `@theme` (`app/globals.css`). Nothing else is set on page content:

| Step | Token / utility | Use |
| --- | --- | --- |
| Display | `--text-display` (`display` utility), 700, tracking -0.045em, leading 0.9 | The name, page titles, service poster lines. Sized `min(var(--text-display), Ncqw)` where a column must hold the longest word |
| Heading | `text-heading`, usually weight 300 | Section titles |
| Lead | `text-lead` | Statements, facts, the intro under a title |
| Body | `text-body` (17px) | Prose, measure ≤ 65ch |
| Small | `text-small` (14px) | Notes, dates, credits |

Rules: no monospace outside real code. No eyebrows or small labels above headings. No 01/02/03 numbering (station codes read "JF 3"). Headings use `text-balance`. `cn()` (`lib/utils.ts`) knows these five steps as font sizes, so `text-heading text-foreground` keeps both.

## 4. Space, radius, layout

- **Frame:** every section sits in the `frame` utility: one pair of margins, `clamp(1rem, 4vw, 3rem)`, max 96rem.
- **Rhythm:** sections are `pt-32 lg:pt-48` apart; space inside a section is clearly smaller.
- **Radius:** panels `rounded-2xl`; buttons are full pills, decided once. Discs and markers are full circles.
- **Shell:** at **`lg` (≥ 1024px)** the sidebar is a **floating panel**: `--sidebar-width: 18rem`, fixed, inset `0.75rem` from the top, bottom and left, `rounded-2xl`, 1px border. Content starts at `sidebar-width + 0.75rem`, and the hero aligns with the panel's top. Below `lg`, a 56px top bar (`h-14`) with a menu **Sheet** holding the same profile, CTAs and nav. The shell is deliberate and stays, even where the taste inspector reports the off-centre frame.
- **Stationery** (`components/stationery.tsx`): the page is the printed timetable of the JF line. Pieces are filled shapes with real edges, drawn as SVG patterns so circles stay round: `CutEdge` (scallop or zigzag), `Perforation` (round holes in the page ground), `Notches` (half circles where a perforation meets an edge).
  - Hero: a **ticket** (`paper`), name and pitch on the body, illustration on the stub, trip details in ticket columns.
  - Services: **poster lines**, one service per line at display size, each a station on a drawn route.
  - Process: a **timetable slip** with dot leaders and a zigzag bottom; the last row inverted.
  - Letter: a sheet with a tear-off strip carrying the email.
  - Contact: a signal-orange **coupon** held against the platform photograph.
  - Footer: the **back of the card**, scalloped top, the name at full width, and the real build receipt.
- **Primary action:** `BookCall`, a solid signal-orange pill (`h-11`+). Secondary actions are plain text links with an arrow.

## 5. Motion

GSAP (with ScrollTrigger and SplitText) is the only motion library; `lib/motion.ts` registers the plugins and holds tokens that mirror the CSS ones. Two React Bits components (`components/react-bits/`, from the `@react-bits` registry) do the component animation, wrapped with the house tokens:

- `RiseText` (React Bits **SplitText**): headings rise out of a line mask. Lines for headings; characters only for a heading of one to three words (the name, page titles).
- `Reveal` (React Bits **AnimatedContent**): a section's parts arrive in reading order, rising 24px, staggered 70ms, once, as the block's top reaches 88% of the viewport.

**When to add motion.** Ask four questions first: how often is it seen, what is it for, which easing, how long. Valid reasons: it shows where something came from, confirms an action, keeps a change from jarring, explains how the work runs, or it is the signature move. "It looks nice" is only valid for the signature move.

| Moment | What moves | Why |
| --- | --- | --- |
| Hero load (once, ≤ 1.2s) | Name rises by character; illustration opens from the bottom and settles; pitch and actions arrive | First impression, still readable on the first frame |
| **Signature:** services route | The line draws from station to station, locked to the scrollbar; each station fills as the line reaches it | It is the idea: database to deploy, as a route |
| Section entrances | Heading lines rise, then text, then pictures; lists arrive row by row | Reading order, once |
| Project covers | Open from the bottom (clip) while the picture settles from 108% | Shows the work arriving |
| Hero picture | Drifts 6% as the hero leaves, scrubbed | The one moving picture |
| Nav pill | Glides from the old station to the new (GSAP FLIP, expo out 0.55s) | Shows where you came from |
| Controls | `press` utility: scale 0.97 on press; colour hovers 180ms | Feedback under the hand |

| Token | Value | Use |
| --- | --- | --- |
| `--ease-glide` / `ease.out` | `cubic-bezier(0.22, 1, 0.36, 1)` / `quint.out` | Entrances and moving hovers under 600ms |
| `--ease-expo` / `ease.expo` | `cubic-bezier(0.16, 1, 0.3, 1)` / `expo.out` | Reveals of 800ms+, line rises |
| `--ease-travel` / `ease.inOut` | `cubic-bezier(0.76, 0, 0.24, 1)` / `quart.inOut` | Wipes and openings |
| `--ease-exit` | `cubic-bezier(0.55, 0.055, 0.675, 0.19)` | Only for the old page leaving |
| `--vt-exit` / `--vt-enter` / `--vt-move` / `--vt-offset` | 150ms / 210ms / 400ms / 60px | Page transitions |

Rules: transform, opacity and clip-path only. No bounce, no custom cursor, no preloader, no scroll hijacking, no loops except the route-art train on hover. Hidden start states exist only under `html.js` (an inline script in `app/layout.tsx`) and `prefers-reduced-motion: no-preference`, with a CSS fallback that shows everything after 2–2.5s if a script never runs. Every GSAP effect sits inside `gsap.matchMedia()`, so under reduced motion the page is simply at rest.

### Page transitions (React `<ViewTransition>`)

- Every `page.tsx` wraps its content in `<PageTransition>` (`components/layout/page-transition.tsx`); the layout never does.
- Nav links set `transitionTypes`: `nav-forward` when the target station is **lower** in the nav than the current one, `nav-back` when it is **higher**.
- `nav-forward`: the old page fades out and drifts up; the new page **rises from 60px below**. `nav-back` mirrors it (the new page drops in from above).
- Untyped transitions (browser back/forward, refresh) do nothing: `default: "none"`.
- The shell is anchored: the sidebar (`site-sidebar`) and the mobile top bar (`site-topbar`) have `animation: none`, so they never move.
- `::view-transition { pointer-events: none }` so clicks during a transition are not lost.
- Reduced motion: crossfade only, no translation.
- Only `translate` and `opacity` are animated.

## 6. Shell anatomy

```
╭────────────────────────╮
│        ( photo )       │  Avatar 112px, line-1 ring
│     Jhovanie Flores    │  Name · role, centered
│ Senior Software Eng.   │
│   [gh] [in] [x] [@]    │  Icon buttons, tooltips, aria-labels
│ (Book a call)(Contact) │  CTA pills
│ ────────────────────── │
│ ● (⌂ Home          )   │  Route line (line-1) with station discs.
│ │                      │  The active disc fills; the active pill
│ ○  ▦ Projects          │  (icon + label) glides between stations
│ │                      │  (GSAP FLIP in nav-links.tsx).
│ ○  ◯ About             │
│ │                      │
│ ○  ✉ Contact           │
│ ────────────────────── │
│ Night map          [☾] │  Theme toggle
╰────────────────────────╯
```

## 6b. Imagery

- Portrait and hero are **illustrations** (`public/images/`); the orange shirt ties them to line 1. They are used large, as plates, never faded into a card.
- The **build receipt** (`components/home/build-receipt.tsx`, `data-ui`) is a real interface fragment: the Next.js version, routes and commit of the build that made the page (`lib/build-info.ts`).
- One found photograph: a black-and-white subway platform by Matthew Wiebe (Unsplash licence), behind the contact coupon as atmosphere, credited in the footer (`site.credits`). It is never presented as Jhovanie's own place.
- Project covers come from `public/work/<slug>/cover.png`; until they exist, each project's generated route map stands in.

## 7. Browser surfaces

Themed from tokens: `::selection` (line-1 on ink), `caret-color` (primary), focus rings (`--ring`, 2px offset), scrollbar colours, `text-underline-offset: 0.2em`, and tabular numerals for data.

## 8. Accessibility floor

Text contrast ≥ 4.5:1 in both themes. Icon-only buttons carry `aria-label`. The active nav link has `aria-current="page"`. There is a "Skip to content" link. Focus is always visible. Touch targets are ≥ 40px on mobile.
