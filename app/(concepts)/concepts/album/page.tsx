import { Comic_Neue } from "next/font/google"

import { Album } from "@/components/concepts/album"

const comic = Comic_Neue({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-comic" })

export const metadata = { title: "Concept: Album" }

export default function AlbumPage() {
  return (
    <div className={comic.variable}>
      <Album />
    </div>
  )
}
