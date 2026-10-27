"use client"

import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

// The desk's camera follows the scroll (ScrollTrigger); the entrance uses GSAP timelines.
gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }
