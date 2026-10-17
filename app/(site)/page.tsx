import { Biography } from "@/components/home/biography"
import { ContactBand } from "@/components/home/contact-band"
import { ExperienceTimeline } from "@/components/home/experience-timeline"
import { HeroCard } from "@/components/home/hero-card"
import { Process } from "@/components/home/process"
import { Services } from "@/components/home/services"
import { TechStrip } from "@/components/home/tech-strip"
import { WorkShowcase } from "@/components/home/work-showcase"
import { PageTransition } from "@/components/layout/page-transition"

export default function HomePage() {
  return (
    <PageTransition>
      <HeroCard />
      <TechStrip />
      <Biography />
      <WorkShowcase />
      <Services />
      <Process />
      <ExperienceTimeline />
      <ContactBand />
    </PageTransition>
  )
}
