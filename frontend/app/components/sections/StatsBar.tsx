"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/app/lib/gsap-config";

interface StatItem {
  value: string;
  unit?: string;
  label: string;
  sublabel?: string;
  icon?: string;
}

interface StatsBarProps {
  data: StatItem[];
  sectionTitle: string;
  sectionSub?: string;
}

export function StatsBar({ data, sectionTitle, sectionSub }: StatsBarProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current) return;
      const el = sectionRef.current;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          end: "top 30%",
          toggleActions: "play none none none",
        },
      });

      tl.fromTo(
        el.querySelector(".sg-lead-eyebrow"),
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.5, ease: "power4.out" },
        0
      );

      tl.fromTo(
        el.querySelector(".sg-lead-val"),
        { opacity: 0, y: 30, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "power4.out" },
        0.15
      );

      tl.fromTo(
        el.querySelectorAll(".sg-lead-label, .sg-lead-sub"),
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: "power3.out" },
        0.4
      );

      tl.fromTo(
        el.querySelector(".sg-rest-header"),
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
        0.2
      );

      tl.fromTo(
        el.querySelectorAll(".sg-row"),
        { opacity: 0, x: 30 },
        { opacity: 1, x: 0, duration: 0.5, stagger: 0.12, ease: "power4.out" },
        0.35
      );
    },
    { dependencies: [], scope: sectionRef }
  );

  const stats = data && data.length ? data : [];
  const lead = stats[0];
  const rest = stats.slice(1);

  return (
    <section ref={sectionRef} className="section-stats">
      <div className="sg-layout">
        {lead && (
          <div className="sg-item sg-lead">
            <p className="sg-lead-eyebrow">Campaign at a glance</p>
            <p className="sg-lead-val">
              {lead.value}
              {lead.unit && <span className="sg-lead-unit">{lead.unit}</span>}
            </p>
            <p className="sg-lead-label">{lead.label}</p>
            <p className="sg-lead-sub">{lead.sublabel}</p>
          </div>
        )}
        <div className="sg-rest">
          <div className="sg-rest-header">
            <h2 className="sg-rest-title">{sectionTitle}</h2>
            {sectionSub && <p className="sg-rest-sub">{sectionSub}</p>}
          </div>
          <div className="sg-rest-list">
            {rest.map((s, i) => (
              <div key={i} className="sg-item sg-row">
                <div className="sg-row-left">
                  <p className="sg-row-val">
                    {s.value}
                    {s.unit && <span className="sg-row-unit">{s.unit}</span>}
                  </p>
                </div>
                <div className="sg-row-right">
                  <p className="sg-row-label">{s.label}</p>
                  <p className="sg-row-sub">{s.sublabel}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
