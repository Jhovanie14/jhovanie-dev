"use client"

import { useState } from "react"
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react"
import { AnimatePresence, MotionConfig, motion } from "motion/react"

import { cn } from "@/lib/utils"

const ease = [0.22, 1, 0.36, 1] as const

/**
 * Shows one server-rendered slide at a time. Direction-aware slide + fade;
 * with reduced motion only the fade remains.
 */
export function ShowcaseCarousel({
  slides,
  titles,
  labels,
  footer,
  className,
}: {
  slides: React.ReactNode[]
  titles: string[]
  labels: { previous: string; next: string; region: string }
  footer?: React.ReactNode
  className?: string
}) {
  const [[index, direction], setPage] = useState<[number, number]>([0, 0])
  const count = slides.length

  function go(step: number) {
    setPage(([i]) => [(i + step + count) % count, step])
  }

  const counter = `${String(index + 1).padStart(2, "0")} / ${String(count).padStart(2, "0")}`

  return (
    <MotionConfig reducedMotion="user">
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label={labels.region}
        className={className}
        onKeyDown={(e) => {
          if (count < 2) return
          if (e.key === "ArrowRight") go(1)
          if (e.key === "ArrowLeft") go(-1)
        }}
      >
        <div className="grid overflow-hidden rounded-2xl">
          <AnimatePresence initial={false} mode="popLayout" custom={direction}>
            <motion.div
              key={index}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} / ${count}: ${titles[index]}`}
              custom={direction}
              variants={{
                enter: (d: number) => ({ opacity: 0, x: d * 48 }),
                center: { opacity: 1, x: 0 },
                exit: (d: number) => ({ opacity: 0, x: d * -48 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.45, ease }}
              className="col-start-1 row-start-1"
            >
              {slides[index]}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4">
          <span aria-hidden className="font-mono text-sm text-muted-foreground tabular-nums">
            {count > 1 ? counter : ""}
          </span>
          {count > 1 && (
            <div className="flex items-center gap-2">
              {[
                { step: -1, label: labels.previous, Icon: IconArrowLeft },
                { step: 1, label: labels.next, Icon: IconArrowRight },
              ].map(({ step, label, Icon }) => (
                <button
                  key={step}
                  type="button"
                  aria-label={label}
                  onClick={() => go(step)}
                  className={cn(
                    "grid size-11 place-items-center rounded-full bg-primary text-primary-foreground transition-transform duration-300 ease-glide",
                    step < 0 ? "hover:-translate-x-0.5" : "hover:translate-x-0.5"
                  )}
                >
                  <Icon aria-hidden stroke={2} className="size-5" />
                </button>
              ))}
            </div>
          )}
          <div className="flex justify-end">{footer}</div>
        </div>
        <p aria-live="polite" className="sr-only">
          {`${index + 1} / ${count}: ${titles[index]}`}
        </p>
      </div>
    </MotionConfig>
  )
}
