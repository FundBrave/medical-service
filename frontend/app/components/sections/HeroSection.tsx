"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import { gsap } from "../../lib/gsap-config";
import { GradientButton } from "../ui/GradientButton";

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const photoWrapRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current || !photoWrapRef.current) return;

      /* ── Parallax (desktop only) ────────────────────────────────────────── */
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        gsap.to(photoWrapRef.current!, {
          yPercent: 20,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current!,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      });

      /* ── Text cascade ───────────────────────────────────────────────────── */
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.fromTo(
        ".hero-badge-row",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 },
        0.2
      );

      tl.fromTo(
        ".hero-line",
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.15 },
        0.4
      );

      tl.fromTo(
        ".hero-subhead",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6 },
        0.9
      );

      tl.fromTo(
        ".hero-cta",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.12 },
        1.1
      );
    },
    { dependencies: [], scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="hero">
      {/* ── Photo layer (parallax target) ──────────────────────────────────── */}
      <div ref={photoWrapRef} className="hero-photo-wrap">
        <Image
          src="/images/woman-1.jpg"
          alt="woman"
          fill
          className="hero-photo"
          priority
        />
        <div className="hero-overlay" />
      </div>

      {/* ── Decorative background blobs + grid ─────────────────────────────── */}
      <div className="hero-bg" />
      <div className="hero-grid" />

      {/* ── Content ────────────────────────────────────────────────────────── */}
      <div className="hero-content">
        <div className="hero-inner">
          {/* Badge */}
          <div className="hero-badge-row">
            <span className="hero-badge">Ongoing Campaign</span>
            <span className="hero-badge-pulse" />
          </div>

          {/* Headline */}
          <h1 className="hero-headline">
            <span className="hero-line" style={{ display: "inline-block" }}>Medical</span>
            <br />
            <span className="hero-line gradient-text" style={{ display: "inline-block" }}>
              Support
            </span>
            <br />
            <span className="hero-line" style={{ display: "inline-block" }}>Fundraising</span>
          </h1>

          {/* Subhead */}
          <p className="hero-subhead">
            A father on dialysis, battling prostate cancer and a severe kidney
            infection. A mother diagnosed with Stage 3 ovarian cancer, awaiting
            surgery. Their children are watching both parents fight for their
            lives at the same time. This family cannot carry these bills alone.
          </p>

          {/* CTAs */}
          <div className="hero-ctas">
            <Link href="/donate">
              <GradientButton size="lg" className="hero-cta btn">
                Support the Mission
              </GradientButton>
            </Link>
            <Link href="/dashboard">
              <GradientButton variant="outline" size="lg" className="hero-cta btn">
                View Transparency Report
              </GradientButton>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
