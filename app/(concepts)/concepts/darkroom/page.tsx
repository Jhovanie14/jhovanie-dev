import { Gloock, Work_Sans } from "next/font/google"

import { Darkroom } from "@/components/concepts/darkroom"

const gloock = Gloock({ subsets: ["latin"], weight: "400", variable: "--font-gloock" })
const work = Work_Sans({ subsets: ["latin"], variable: "--font-work" })

export const metadata = { title: "Concept: Darkroom" }

export default function DarkroomPage() {
  return (
    <div className={`${gloock.variable} ${work.variable}`}>
      <Darkroom />
    </div>
  )
}
