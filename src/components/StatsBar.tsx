"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { animateSectionEntrance } from "@/lib/animations";
import { Icon } from "./Icon";

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

const STAT_TONES = ["primary", "secondary", "tertiary", "primary"] as const;

export function StatsBar({ data, sectionTitle, sectionSub }: StatsBarProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current) return;
      animateSectionEntrance(sectionRef.current, {
        children: ".stat-cell",
        stagger: 0.12,
      });
    },
    { dependencies: [], scope: sectionRef }
  );

  const stats = data && data.length ? data : [];
  return (
    <section ref={sectionRef} className="section-stats">
      <div className="stats-head">
        <div>
          <p className="stats-eyebrow-line">Campaign at a glance</p>
          <h2 className="stats-head-title">{sectionTitle}</h2>
        </div>
        {sectionSub && <p className="stats-head-sub">{sectionSub}</p>}
      </div>
      <div className="stats-row">
        {stats.map((s, i) => (
          <div key={i} className="stat-cell">
            <div className="stat-cell-head">
              {s.icon && (
                <div className={`stat-cell-icon ${STAT_TONES[i % STAT_TONES.length]}`}>
                  <Icon name={s.icon} size={22} fill={1} />
                </div>
              )}
              <span className="stat-cell-num">{String(i + 1).padStart(2, "0")}</span>
            </div>
            <p className="stat-cell-val">
              {s.value}
              {s.unit && <span className="unit">{s.unit}</span>}
            </p>
            <p className="stat-cell-label">{s.label}</p>
            <p className="stat-cell-sub">{s.sublabel}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
