"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

if (typeof window !== "undefined") {
  const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
  const apply = (reduced: boolean) => {
    gsap.globalTimeline.timeScale(reduced ? 999 : 1);
  };
  apply(mql.matches);
  mql.addEventListener("change", (e) => apply(e.matches));
}

export { gsap, ScrollTrigger };
