import { Silkscreen } from "next/font/google"

import { Cracktro } from "@/components/concepts/cracktro"

const silkscreen = Silkscreen({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-silkscreen" })

export const metadata = { title: "Concept: Cracktro" }

export default function CracktroPage() {
  return (
    <div className={silkscreen.variable}>
      <Cracktro />
    </div>
  )
}
