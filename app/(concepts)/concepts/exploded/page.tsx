import { Familjen_Grotesk } from "next/font/google"

import { Exploded } from "@/components/concepts/exploded"

const familjen = Familjen_Grotesk({ subsets: ["latin"], variable: "--font-familjen" })

export const metadata = { title: "Concept: Exploded" }

export default function ExplodedPage() {
  return (
    <div className={familjen.variable}>
      <Exploded />
    </div>
  )
}
