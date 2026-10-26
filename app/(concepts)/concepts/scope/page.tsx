import { Chakra_Petch } from "next/font/google"

import { Scope } from "@/components/concepts/scope"

const chakra = Chakra_Petch({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-chakra" })

export const metadata = { title: "Concept: Scope" }

export default function ScopePage() {
  return (
    <div className={chakra.variable}>
      <Scope />
    </div>
  )
}
