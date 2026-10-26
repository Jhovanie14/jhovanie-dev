import { ContactCoupon } from "@/components/home/contact-coupon"
import { HeroTicket } from "@/components/home/hero-ticket"
import { IntroFacts } from "@/components/home/intro-facts"
import { Letter } from "@/components/home/letter"
import { ProcessSlip } from "@/components/home/process-slip"
import { ServicesLine } from "@/components/home/services-line"
import { WorkIndex } from "@/components/home/work-index"
import { PageTransition } from "@/components/layout/page-transition"

/** The line, stop by stop (DESIGN.md §6). */
export default function HomePage() {
  return (
    <PageTransition>
      <HeroTicket />
      <IntroFacts />
      <WorkIndex />
      <ServicesLine />
      <ProcessSlip />
      <Letter />
      <ContactCoupon />
    </PageTransition>
  )
}
