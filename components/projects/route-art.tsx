import { useId } from "react"

import { routeArt } from "@/lib/route-art"

/**
 * A project's own map fragment, drawn in its line colour (`--line`).
 * A train runs the line while an ancestor `.group` is hovered or
 * `[data-active]` is set (see .route-train in globals.css).
 */
export function RouteArt({ seed, fine = false }: { seed: string; fine?: boolean }) {
  const id = useId()
  const { main, stations, others } = routeArt(seed)
  const last = stations.length - 1

  // `fine`: for large covers. Hairline strokes that stay thin at any size, smaller stations.
  const w = fine
    ? { main: 2.5, other: 1, station: 1.5, r: 2.4, end: 3.6, hole: 1.4, dot: 0.6 }
    : { main: 4.5, other: 3, station: 2.5, r: 4.5, end: 7.5, hole: 3, dot: 0.9 }
  const scaling = fine ? ("non-scaling-stroke" as const) : undefined

  return (
    <svg
      aria-hidden
      viewBox="0 0 320 200"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 size-full"
    >
      <defs>
        <pattern id={id} width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r={w.dot} fill="var(--foreground)" opacity="0.1" />
        </pattern>
      </defs>
      <rect width="320" height="200" fill={`url(#${id})`} />

      {others.map((d) => (
        <path
          key={d}
          d={d}
          fill="none"
          stroke="var(--muted-foreground)"
          strokeOpacity="0.22"
          strokeWidth={w.other}
          vectorEffect={scaling}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}

      <path
        d={main}
        fill="none"
        stroke="var(--line)"
        strokeWidth={w.main}
        vectorEffect={scaling}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={main}
        pathLength={100}
        className="route-train"
        fill="none"
        stroke="var(--foreground)"
        strokeWidth={w.main}
        vectorEffect={scaling}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {stations.map(([x, y], i) =>
        i === 0 || i === last ? (
          <g key={i}>
            <circle cx={x} cy={y} r={w.end} fill="var(--line)" />
            <circle cx={x} cy={y} r={w.hole} fill="var(--card)" />
          </g>
        ) : (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={w.r}
            fill="var(--card)"
            stroke="var(--line)"
            strokeWidth={w.station}
            vectorEffect={scaling}
          />
        )
      )}
    </svg>
  )
}
