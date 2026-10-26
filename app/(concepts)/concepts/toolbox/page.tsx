import { Rubik } from "next/font/google"

import { Toolbox } from "@/components/concepts/toolbox"

const rubik = Rubik({ subsets: ["latin"], variable: "--font-rubik" })

export const metadata = { title: "Concept: Toolbox" }

export default function ToolboxPage() {
  return (
    <div className={rubik.variable}>
      <Toolbox />
    </div>
  )
}
