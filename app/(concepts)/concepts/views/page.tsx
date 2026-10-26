import { Hanken_Grotesk } from "next/font/google"

import { Views } from "@/components/concepts/views"

const hanken = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-hanken" })

export const metadata = { title: "Concept: Two views" }

export default function ViewsPage() {
  return (
    <div className={hanken.variable}>
      <Views />
    </div>
  )
}
