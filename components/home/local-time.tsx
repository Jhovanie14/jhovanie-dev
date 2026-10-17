"use client"

import { useSyncExternalStore } from "react"

const PENDING = "pending"
const formatters = new Map<string, Intl.DateTimeFormat>()

function formatTime(timeZone: string) {
  try {
    let formatter = formatters.get(timeZone)
    if (!formatter) {
      formatter = new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone,
      })
      formatters.set(timeZone, formatter)
    }
    return formatter.format(new Date())
  } catch {
    return null // invalid timezone in site.ts
  }
}

function subscribe(onChange: () => void) {
  const id = setInterval(onChange, 10_000)
  return () => clearInterval(id)
}

export function LocalTime({ timeZone, label }: { timeZone: string; label: string }) {
  const time = useSyncExternalStore(
    subscribe,
    () => formatTime(timeZone),
    () => PENDING
  )

  if (time === null) return null

  return (
    <span>
      <time className="font-mono text-foreground tabular-nums">
        {time === PENDING ? "--:--" : time}
      </time>{" "}
      {label}
    </span>
  )
}
