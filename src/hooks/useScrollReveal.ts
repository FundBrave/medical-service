"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "../lib/gsap-config";

interface ScrollRevealOptions {
  y?: number;
  delay?: number;
  duration?: number;
  start?: string;
}

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options?: ScrollRevealOptions
) {
  const ref = useRef<T>(null);
  const { y = 30, delay = 0, duration = 0.6, start = "top 85%" } = options ?? {};

  useGSAP(
    () => {
      if (!ref.current) return;
      gsap.fromTo(
        ref.current,
        { y, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration,
          delay,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ref.current,
            start,
            toggleActions: "play none none none",
          },
        }
      );
    },
    { dependencies: [] }
  );

  return ref;
}
