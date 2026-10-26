import { Big_Shoulders } from "next/font/google"

import { City } from "@/components/concepts/city"

const shoulders = Big_Shoulders({ subsets: ["latin"], variable: "--font-bsd" })

export const metadata = { title: "Concept: Night city" }

export default function CityPage() {
  return (
    <div className={shoulders.variable}>
      <City />
    </div>
  )
}
