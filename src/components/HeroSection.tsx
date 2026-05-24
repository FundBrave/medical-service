"use client";

import { useRef } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap-config";
import { GradientButton } from "./GradientButton";

interface Campaign {
  headlineParts: { text: string; gradient?: boolean }[];
  subhead: string;
}

interface HeroSectionProps {
  campaign: Campaign;
  heroImage?: string;
  onDonate: () => void;
  onTransparency: () => void;
}

export function HeroSection({ campaign, heroImage, onDonate, onTransparency }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      // Parallax — desktop only
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        const bg = sectionRef.current!.querySelector(".hero-photo-wrap");
        if (bg) {
          gsap.to(bg, {
            yPercent: 20,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current!,
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          });
        }
      });

      // Text cascade
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.fromTo(".hero-badge-row", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, 0.2);
      tl.fromTo(".hero-line", { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.15 }, 0.4);
      tl.fromTo(".hero-subhead", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, 0.9);
      tl.fromTo(".hero-cta-item", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.12 }, 1.1);
    },
    { dependencies: [], scope: sectionRef }
  );

  return (
    <section className="hero" ref={sectionRef}>
      {heroImage && (
        <div className="hero-photo-wrap" ref={bgRef}>
          <Image
            src={heroImage}
            alt=""
            fill
            priority
            className="hero-photo"
          />
          <div className="hero-overlay" aria-hidden="true" />
        </div>
      )}
      <div className="hero-bg" aria-hidden="true" />
      <div className="hero-grid" aria-hidden="true" />
      <div className="hero-content">
        <div className="hero-inner">
          <div className="hero-badge-row">
            <span className="hero-badge">Ongoing Campaign</span>
            <span className="hero-badge-pulse" />
          </div>
          <h1 className="hero-headline">
            {campaign.headlineParts.map((part, i) => (
              <span key={i} className="hero-line">
                <span className={part.gradient ? "gradient-text" : ""}>{part.text}</span>
                {i < campaign.headlineParts.length - 1 && <br />}
              </span>
            ))}
          </h1>
          <p className="hero-subhead">{campaign.subhead}</p>
          <div className="hero-ctas">
            <span className="hero-cta-item">
              <GradientButton variant="primary" size="lg" onClick={onDonate}>
                Support the Mission
              </GradientButton>
            </span>
            <span className="hero-cta-item">
              <GradientButton variant="outline" size="lg" onClick={onTransparency}>
                View Transparency Report
              </GradientButton>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
