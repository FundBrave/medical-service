"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";

import { animateSectionEntrance, animateCounter } from "@/app/lib/animations";
import { Icon } from "./Icon";
import { ProgressBar } from "./ProgressBar";
import { GlassCard } from "../ui/GlassCard";
import { AvatarDot } from "./AvatarDot";

interface ProgressCardProps {
  campaign: { goal: number; goalNGN?: number; endDate: string };
  stats: { raised: number; donors: number; daysLeft: number };
  rate: number;
}

export function ProgressCard({ campaign, stats, rate }: ProgressCardProps) {
  const pct = Math.round((stats.raised / campaign.goal) * 100);
  const sectionRef = useRef<HTMLElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const raisedNgnRef = useRef<HTMLSpanElement>(null);
  const raisedUsdRef = useRef<HTMLSpanElement>(null);
  const donorRef = useRef<HTMLParagraphElement>(null);
  const avgRef = useRef<HTMLParagraphElement>(null);
  const disbursedRef = useRef<HTMLParagraphElement>(null);
  const progressRef = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      const tl = animateSectionEntrance(sectionRef.current, {
        header: ".progress-label",
      });

      // Right cards stagger
      tl.fromTo(
        sectionRef.current.querySelectorAll(".right-card, .donor-avatars"),
        { x: 30, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, stagger: 0.15, ease: "power2.out" },
        0.5
      );

      // Progress bar fill — added to timeline for proper cleanup
      const bar = sectionRef.current.querySelector(".progress-bar-fill") as HTMLElement;
      if (bar) {
        const width = bar.style.width;
        tl.fromTo(bar, { width: "0%" }, { width, duration: 1.5, ease: "power2.out" }, 0.3);
      }

      // Counter animations — added to timeline so they fire after scroll trigger
      const raisedNgn = Math.round(stats.raised * rate);
      if (raisedNgnRef.current && raisedNgn > 0) {
        tl.add(animateCounter(raisedNgnRef.current, raisedNgn, { prefix: "₦", duration: 1.8 }), 0.3);
      }
      if (raisedUsdRef.current && stats.raised > 0) {
        tl.add(animateCounter(raisedUsdRef.current, stats.raised, { prefix: "≈ $", duration: 1.8 }), 0.3);
      }
      if (donorRef.current && stats.donors > 0) {
        tl.add(animateCounter(donorRef.current, stats.donors, { duration: 1.4 }), 0.4);
      }
      if (avgRef.current) {
        const avgUsd = stats.donors > 0 ? Math.round(stats.raised / stats.donors) : 0;
        const avgNgn = Math.round(avgUsd * rate);
        if (avgNgn > 0) tl.add(animateCounter(avgRef.current, avgNgn, { prefix: "₦", duration: 1.4 }), 0.4);
      }
      if (disbursedRef.current) {
        const disbursedNgn = Math.round(stats.raised * 0.94 * rate);
        if (disbursedNgn > 0) tl.add(animateCounter(disbursedRef.current, disbursedNgn, { prefix: "₦", duration: 1.4 }), 0.4);
      }
      if (progressRef.current && pct > 0) {
        tl.add(animateCounter(progressRef.current, pct, { suffix: "%", duration: 1.4 }), 0.4);
      }
    },
    { dependencies: [], scope: sectionRef }
  );

  return (
    <section className="progress-section" ref={sectionRef}>
      <GlassCard style={{ padding: 48, maxWidth: 1440, margin: "0 auto" }}>
        <div className="progress-grid">
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, gap: 24, flexWrap: "wrap" }}>
              <div>
                <p className="progress-label">Total Raised</p>
                <span className="money money-xl money-stack">
                  <span className="money-ngn" ref={raisedNgnRef}>₦0</span>
                  <span className="money-usd" ref={raisedUsdRef}>≈ $0</span>
                </span>
                <p className="progress-meta" style={{ marginTop: 12 }}>
                  of <span className="money money-sm"><span className="money-ngn">₦{new Intl.NumberFormat("en-NG").format(campaign.goalNGN || Math.round(campaign.goal * rate))}</span> <span className="money-usd">≈ ${new Intl.NumberFormat("en-US").format(campaign.goal)}</span></span> goal · settles in USDC
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--tertiary)", marginBottom: 4 }}>
                  <Icon name="schedule" size={18} />
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{stats.daysLeft} Days Left</span>
                </div>
                <p style={{ color: "var(--on-surface-variant)", fontSize: 12, margin: 0 }}>
                  Campaign ends {campaign.endDate}
                </p>
              </div>
            </div>
            <ProgressBar value={stats.raised} max={campaign.goal} />
            <div className="progress-stats">
              <div className="pstat-cell">
                <p className="pstat-label">Donors</p>
                <p className="pstat-primary" ref={donorRef}>{stats.donors}</p>
                <p className="pstat-secondary">unique contributors</p>
              </div>
              <div className="pstat-cell">
                <p className="pstat-label">Avg gift</p>
                <p className="pstat-primary" ref={avgRef}>₦{new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 }).format(Math.round((stats.donors > 0 ? stats.raised / stats.donors : 0) * rate))}</p>
                <p className="pstat-secondary">≈ ${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(stats.donors > 0 ? Math.round(stats.raised / stats.donors) : 0)}</p>
              </div>
              <div className="pstat-cell">
                <p className="pstat-label">Disbursed</p>
                <p className="pstat-primary" ref={disbursedRef}>₦{new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 }).format(Math.round(stats.raised * 0.94 * rate))}</p>
                <p className="pstat-secondary">≈ ${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.round(stats.raised * 0.94))}</p>
              </div>
              <div className="pstat-cell">
                <p className="pstat-label">Goal Progress</p>
                <p className="pstat-primary" ref={progressRef}>{pct}%</p>
                <p className="pstat-secondary">of ₦{new Intl.NumberFormat("en-NG").format(campaign.goalNGN || Math.round(campaign.goal * rate))} goal</p>
              </div>
            </div>
          </div>
          <div className="progress-right">
            <div className="right-card">
              <div>
                <h3 className="right-card-label">Impact Multiplier</h3>
                <p className="right-card-value">1.85x</p>
              </div>
              <div className="right-card-icon secondary">
                <Icon name="trending_up" />
              </div>
            </div>
            <div className="right-card">
              <div>
                <h3 className="right-card-label">Verification</h3>
                <p className="right-card-value primary">On-Chain Verified</p>
              </div>
              <div className="right-card-icon primary">
                <Icon name="verified" fill={1} />
              </div>
            </div>
            <div className="donor-avatars">
              <div className="donor-avatars-row">
                <AvatarDot initials="MA" hue={20} />
                <span style={{ marginLeft: -12 }}><AvatarDot initials="TK" hue={120} /></span>
                <span style={{ marginLeft: -12 }}><AvatarDot initials="JS" hue={220} /></span>
                <span style={{ marginLeft: -12 }} className="donor-avatar-more">
                  +{Math.max(stats.donors - 3, 0)}
                </span>
              </div>
              <p className="donor-text">Donors gain exclusive voting power for the next funding cycle.</p>
            </div>
          </div>
        </div>
      </GlassCard>
    </section>
  );
}
