# DESIGN.md — "The Desk"

The site is **Jhovanie's desk at night**, rendered in real time with Three.js. Scrolling flies the camera between five stops in the room; each stop has an HTML panel beside it that carries the same content, so everything reads without the 3D. Product truth lives in [`PRODUCT.md`](PRODUCT.md) and [`content/site.ts`](content/site.ts); this file owns the visual and interaction system.

## Stops

| Stop | In the room | Panel |
| --- | --- | --- |
| `intro` | The whole room from the doorway | Name, role, availability, Contact me + Download CV |
| `projects` | The monitor as a file explorer: folders by category, a page of project cards, then a playing case study | Category chips (once there are two or more categories), the paged project list, or the open case study with screenshot thumbnails |
| `skills` | The shelf: one book per skill, named on the spine | Skills by group |
| `experience` | The board on the left wall: a list of roles that turns into a menu when one is opened | Roles as an accordion; the open one shows its highlights and stack |
| `contact` | The "Hiring?" note on the desk | Email (copy), GitHub, WhatsApp, CV |

Camera positions are `CAMERA` in [`components/desk/desk-site.tsx`](components/desk/desk-site.tsx). On wide screens (aspect > 1.2) the camera shifts so objects sit right of the panel; on narrow screens it pulls back.

## Colour

A dark room, warm white text, and one orange taken from the shirt in the portrait, used for the primary action and anything live. Tokens are in [`app/globals.css`](app/globals.css):

| Token | Value | Use |
| --- | --- | --- |
| `--background` | `#0d0d10` | Page and scene background |
| `--foreground` | `#f2ede6` | Text |
| `--card` | `#151518` | Panels (at 95% opacity over the scene) |
| `--popover` | `#1c1c20` | Raised controls inside panels |
| `--primary` | `#ff7a1a` | Primary action, focus ring, the live dot |
| `--primary-hover` | `#ff9142` | Primary hover |
| `--accent-ink` | `#ff9a52` | Orange text: labels, back links |
| `--muted-foreground` | `#a39d94` | Secondary text |
| `--border` | `rgb(242 237 230 / 12%)` | Hairlines |

No gradients in the UI. Colour in the scene comes from materials and light (oak, rug, book spines, lamp).

## Type

- **Unbounded** (`--font-unbounded`, `font-heading`): display, at extra-bold. Also drawn into the room's canvases (monitor, board, note).
- **Onest** (`--font-onest`, `font-sans`): everything else. Load it without a `weight` array (Turbopack breaks on it).

## Motion

GSAP 3 (`lib/gsap.ts` registers ScrollTrigger). Everything respects `prefers-reduced-motion`: the camera snaps between stops and nothing autoplays.

- **Entrance:** the camera glides in from the doorway; the lamp flickers on, the room fills, the monitor boots, then lists the work. The intro panel fades up with it (`[data-load]`, with a 2 s CSS fallback).
- **Scroll:** ScrollTrigger progress drives the camera along the stops with smoothstep easing.
- **Monitor:** a case study plays its screenshots; tall pages scroll top to bottom, wide ones push in and drift, with a 0.8 s crossfade every 6 s. In the explorer, turning a page slides the old page of cards out and the new one in (0.55 s, ease-out cubic), and opening a folder fades its cards in; the panel list moves with it.
- **Experience board:** opening a role eases the camera in towards the board and over to the role's card; the role's bar sweeps in orange and the card slides in from the right (0.5 s, ease-out cubic). Closing it pulls back.
- **Screenshot viewer:** opens out of the tapped thumbnail (clip-path + scale, `expo.out`) and closes back into the thumbnail of the shot it ends on.

## Interaction

- Drag to look around; point at an object to name it; click an object to fly to its stop; click the lamp to switch it.
- On the monitor: click a folder to filter, a card to open its project, Prev / Next to turn the page, "← All projects" to go back (to the same folder and page), and the playing screenshot to open it full size.
- On the board: click a role to open it, and click it again (or its row in the panel) to close it.
- The full-size viewer is a native `<dialog>`: swipe or arrow keys between shots, tall shots scroll, and Back, Escape, swipe down or the cross close it. The room stops rendering while it is open.

## Responsive and fallbacks

- Panels sit at the bottom on phones and beside the scene from `lg`. They never run taller than the screen below the header; long ones scroll inside.
- Phones render at a lower pixel ratio without shadows.
- Without WebGL, the illustration stands in for the room; the panels still carry every word.

## Files

| File | Owns |
| --- | --- |
| `components/desk/desk-site.tsx` | Scene setup, camera, input, panels, header |
| `components/desk/room.ts` | The room's geometry, materials, lights and hotspots |
| `components/desk/screen.ts` | Drawing the monitor and mapping clicks on it |
| `components/desk/board.ts` | Drawing the experience board and mapping clicks on it |
| `components/desk/shot-viewer.tsx` | The full-size screenshot dialog |
| `components/desk/textures.ts` | Canvas textures (wood, wall) and text wrapping |
