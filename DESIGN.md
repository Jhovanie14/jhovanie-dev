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

**Edge light** (`edge-light` utility): every card carries a 1px line along its bottom edge, brightest at the centre, in `--edge` (defaults to line 1; project cards use their own line). This is the one gradient the system allows.

**Never:** other gradients, glows, coloured halos, glass panels, gradient text.

## 3. Type

| Role | Face | Token |
| --- | --- | --- |
| Display, headings, UI, body | **Overpass** (variable 100–900, derived from US highway signage) | `--font-sans`, `--font-heading` |
| Data: dates, times, station/project codes, tabular numbers | **Overpass Mono** (variable) | `--font-mono` |

Loaded with `next/font/google` (self-hosted, no layout shift) as `--font-overpass` / `--font-overpass-mono`.

Scale (Tailwind sizes):

| Step | Size / weight | Use |
| --- | --- | --- |
| Display | `text-5xl`–`text-6xl` / 600, `tracking-tight` | Page titles (max 6rem) |
| H2 | `text-2xl` / 600 | Section headings |
| H3 | `text-lg` / 600 | Card titles |
| Body | `text-base` / 400, `leading-relaxed`, measure ≤ `65ch` | Prose |
| Small | `text-sm` | UI labels, nav, role |
| Data | `font-mono text-xs tabular-nums` | Dates, codes |

Rules: mono is for **data only**, never decoration. No eyebrows/kickers above headings. Headings use `text-balance`.

## 4. Space, radius, layout

- **Spacing:** Tailwind's 4px scale. Tight inside groups (`gap-1`–`gap-3`), generous between sections (`py-16`–`py-24`). More space above a heading than below it.
- **Radius:** `--radius: 0.5rem` (signage corners). Discs and markers are full circles.
- **Shell:** at **`lg` (≥ 1024px)** the sidebar is a **floating panel**: `--sidebar-width: 18rem`, fixed, inset `0.75rem` from the top, bottom and left, `rounded-2xl`, 1px border. Content starts at `sidebar-width + 0.75rem`, and the first card aligns with the panel's top. Below `lg`, a 56px top bar (`h-14`) with a menu **Sheet** holding the same profile, CTAs and nav.
- **Content:** full width, gutters `px-4 sm:px-6 md:px-10 lg:px-12`.
- **Cards:** `rounded-2xl`, `bg-card`, 1px border, no shadow. Used for framed moments (the hero), never as a grid of same-size boxes.
- **Project cards:** framed cards with the cover (or a line placard showing the project code) and a round arrow button that fills with the project's line colour on hover. Featured work is a bento: the first card spans the row (cover beside text), the next two share a row.
- **Section header:** a small pill label (dot + word) on the left, a big title on the right (`text-5xl`, weight 500, tracking -0.035em); stacked on mobile. Component: `SectionHeader`.
- **CTAs:** pills (`rounded-full`, `h-10`–`h-11`) with a detached round arrow that turns to point right on hover (`CtaPill`). Primary = signal orange with dark ink; secondary = outline.

## 5. Motion

One authored moment per view. Everything respects `prefers-reduced-motion`.

| Token | Value | Use |
| --- | --- | --- |
| `--ease-glide` | `cubic-bezier(0.22, 1, 0.36, 1)` | Exponential ease-out for movement |
| `--vt-exit` | `150ms` | Old page fades out (fast) |
| `--vt-enter` | `210ms` | New page fades in, delayed by `--vt-exit` |
| `--vt-move` | `400ms` | New page slide |
| `--vt-offset` | `60px` | Slide distance |
| `spring.marker` (`lib/motion.ts`) | stiffness 380, damping 34, mass 0.8 | Active nav pill glide: damped and physical, never snapped |
| Logo strip | `45s` linear loop | Monochrome logos + bold names, edges masked. Pauses on hover and on keyboard focus; with reduced motion it stops and wraps |

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
│ │                      │  (motion layoutId).
│ ○  ◯ About             │
│ │                      │
│ ○  ✉ Contact           │
│ ────────────────────── │
│ Night map          [☾] │  Theme toggle
╰────────────────────────╯
```

## 6b. Imagery

- Portrait and hero are **illustrations** (`public/images/`); the orange shirt ties them to line 1.
- The hero illustration sits in the card's right column and fades into the card toward the copy (`mask-l` on desktop, `mask-b` on mobile). Fades are masks, never gradient overlays.
- Tech marks come from Tabler (one stroke weight), in `muted-foreground`, brightening on hover. PostgreSQL, DigitalOcean and Claude have no Tabler mark and use generic icons (database, cloud, sparkles).

## 7. Browser surfaces

Themed from tokens: `::selection` (line-1 on ink), `caret-color` (primary), focus rings (`--ring`, 2px offset), scrollbar colours, `text-underline-offset: 0.2em`, and tabular numerals for data.

## 8. Accessibility floor

Text contrast ≥ 4.5:1 in both themes. Icon-only buttons carry `aria-label`. The active nav link has `aria-current="page"`. There is a "Skip to content" link. Focus is always visible. Touch targets are ≥ 40px on mobile.
