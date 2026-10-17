import { useId } from "react"

import { routeArt } from "@/lib/route-art"

/**
 * A project's own map fragment, drawn in its line colour (`--line`).
 * A train runs the line while an ancestor `.group` is hovered or
 * `[data-active]` is set (see .route-train in globals.css).
 */
export function RouteArt({ seed }: { seed: string }) {
  const id = useId()
  const { main, stations, others } = routeArt(seed)
  const last = stations.length - 1

  return (
    <svg
      aria-hidden
      viewBox="0 0 320 200"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 size-full"
    >
      <defs>
        <pattern id={id} width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.9" fill="var(--foreground)" opacity="0.1" />
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
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}

      <path
        d={main}
        fill="none"
        stroke="var(--line)"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={main}
        pathLength={100}
        className="route-train"
        fill="none"
        stroke="var(--foreground)"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {stations.map(([x, y], i) =>
        i === 0 || i === last ? (
          <g key={i}>
            <circle cx={x} cy={y} r="7.5" fill="var(--line)" />
            <circle cx={x} cy={y} r="3" fill="var(--card)" />
          </g>
        ) : (
          <circle key={i} cx={x} cy={y} r="4.5" fill="var(--card)" stroke="var(--line)" strokeWidth="2.5" />
        )
      )}
    </svg>
  )
}
