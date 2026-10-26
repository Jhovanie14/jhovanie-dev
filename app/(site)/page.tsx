import { AboutBrief } from "@/components/home/about-brief"
import { Contact } from "@/components/home/contact"
import { Hero } from "@/components/home/hero"
import { Services } from "@/components/home/services"
import { Work } from "@/components/home/work"
import { PageTransition } from "@/components/layout/page-transition"

export default function HomePage() {
  return (
    <PageTransition>
      <Hero />
      <Work />
      <Services />
      <AboutBrief />
      <Contact />
    </PageTransition>
  )
}
