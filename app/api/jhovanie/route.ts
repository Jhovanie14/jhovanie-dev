import { site } from "@/content/site"

/**
 * The request the hero trace sends. A real handler on the deployed stack,
 * answering with real data from site.ts, so the status, the body and the
 * time the visitor sees are measured, not drawn. Dynamic by default (GET
 * handlers are not cached), so every send is a fresh round trip.
 */
export function GET() {
  const stack = Object.fromEntries(
    site.skills.flatMap(({ layer, items }) => (layer ? [[layer, items]] : []))
  )

  return Response.json(
    {
      name: site.name,
      role: site.role,
      available: site.availability.open,
      location: site.location,
      stack,
      book: site.bookingUrl,
      servedAt: new Date().toISOString(),
    },
    { headers: { "Cache-Control": "no-store" } }
  )
}
