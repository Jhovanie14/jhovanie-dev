import { Onest, Unbounded } from "next/font/google"

import { DeskRoom } from "@/components/concepts/desk-room"
import { site } from "@/content/site"
import { isLinkAvailable } from "@/lib/assets"

const unbounded = Unbounded({ subsets: ["latin"], weight: ["500", "800"], variable: "--font-unbounded" })
const onest = Onest({ subsets: ["latin"], variable: "--font-onest" })

export const metadata = { title: "Prototype: 3D desk" }

export default function DeskPage() {
  return (
    <div className={`${unbounded.variable} ${onest.variable}`}>
      <DeskRoom
        displayFamily={unbounded.style.fontFamily}
        bodyFamily={onest.style.fontFamily}
        cv={site.cvUrl && isLinkAvailable(site.cvUrl) ? site.cvUrl : null}
      />
    </div>
  )
}
