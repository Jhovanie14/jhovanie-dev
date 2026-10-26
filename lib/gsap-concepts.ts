"use client"

import { gsap } from "gsap"
import { Draggable } from "gsap/Draggable"
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin"
import { Flip } from "gsap/Flip"
import { InertiaPlugin } from "gsap/InertiaPlugin"
import { MotionPathPlugin } from "gsap/MotionPathPlugin"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { SplitText } from "gsap/SplitText"
import { useGSAP } from "@gsap/react"

// Every plugin the concept pages use, registered once (all free since GSAP 3.13).
gsap.registerPlugin(Draggable, DrawSVGPlugin, Flip, InertiaPlugin, MotionPathPlugin, ScrollTrigger, SplitText, useGSAP)

export const motionOK = "(prefers-reduced-motion: no-preference)"

export { Draggable, DrawSVGPlugin, Flip, gsap, InertiaPlugin, MotionPathPlugin, ScrollTrigger, SplitText, useGSAP }
