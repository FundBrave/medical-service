"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "../../lib/gsap-config";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import { useCampaignStats } from "../../hooks/useCampaignStats";
import { useNGNRate } from "../../hooks/useNGNRate";
import { CAMPAIGN_GOAL_NGN } from "../../lib/contracts";

const fmtNGN = (n: number) =>
  new Intl.NumberFormat("en-NG").format(Math.round(n));

export function DonateCampaignBanner() {
  const stats = useCampaignStats();
  const { rate } = useNGNRate();
  const bannerRef = useScrollReveal<HTMLDivElement>({ y: 20, duration: 0.5 });
  const barRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  const progressPercent = stats.progressPercent;
  const raisedUSDC = Number(stats.totalRaised) / 1e6;
  const raisedNGN = Math.round(raisedUSDC * rate);

  const daysRemaining = stats.deadline
    ? Math.max(0, Math.ceil((Number(stats.deadline) - Date.now() / 1000) / 86400))
    : null;

  useGSAP(
    () => {
      if (!barRef.current || progressPercent <= 0) return;
      if (hasAnimated.current) {
        gsap.set(barRef.current, { width: `${Math.min(progressPercent, 100)}%` });
        return;
      }
      hasAnimated.current = true;
      gsap.fromTo(
        barRef.current,
        { width: "0%" },
        { width: `${Math.min(progressPercent, 100)}%`, duration: 1.2, ease: "power2.out", delay: 0.3 }
      );
    },
    { dependencies: [progressPercent] }
  );

  return (
    <div
      ref={bannerRef}
      className="relative overflow-hidden rounded-2xl border border-outline-variant/10"
      style={{ background: "rgba(17,24,39,0.75)", backdropFilter: "blur(24px)" }}
    >
      {/* Subtle background glows */}
      <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full pointer-events-none"
        style={{ background: "rgba(37,99,235,0.07)", filter: "blur(48px)" }} />
      <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full pointer-events-none"
        style={{ background: "rgba(124,58,237,0.07)", filter: "blur(40px)" }} />

      {/* Header row */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span
            className="material-symbols-outlined text-primary"
            style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}
          >
            monitoring
          </span>
          <span className="text-xs font-bold uppercase tracking-widest"
            style={{ color: "var(--on-surface-variant)" }}>
            Campaign Progress
          </span>
        </div>
        {stats.isActive ? (
          <div className="flex items-center gap-1.5">
            <span
              className="block w-1.5 h-1.5 rounded-full"
              style={{ background: "#10b981", boxShadow: "0 0 6px #10b981", animation: "pulse 2s infinite" }}
            />
            <span className="text-xs font-semibold" style={{ color: "#10b981" }}>Active</span>
          </div>
        ) : (
          <span className="text-xs font-semibold" style={{ color: "var(--on-surface-variant)" }}>Ended</span>
        )}
      </div>

      {/* Main figures */}
      <div className="flex items-end justify-between gap-3 px-5 pt-4 pb-3">
        <div>
          <div
            className="font-headline font-black leading-none"
            style={{ fontSize: 32, background: "linear-gradient(90deg,#2563eb,#7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
          >
            ₦{fmtNGN(raisedNGN)}
          </div>
          <div className="text-sm mt-1" style={{ color: "var(--on-surface-variant)" }}>
            raised of{" "}
            <span style={{ color: "var(--on-surface)", fontWeight: 600 }}>
              ₦{fmtNGN(CAMPAIGN_GOAL_NGN)}
            </span>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div
            className="font-headline font-bold leading-none"
            style={{ fontSize: 26, color: "var(--tertiary, #f97316)" }}
          >
            {progressPercent.toFixed(0)}%
          </div>
          <div className="text-xs uppercase tracking-wider mt-1" style={{ color: "var(--on-surface-variant)" }}>
            funded
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-5 pb-4">
        <div
          className="w-full rounded-full overflow-hidden"
          style={{ height: 8, background: "rgba(67,70,85,0.25)" }}
        >
          <div
            ref={barRef}
            className="progress-gradient-bg h-full rounded-full"
            style={{ width: "0%" }}
          />
        </div>
      </div>

      {/* Footer stats */}
      <div
        className="flex items-center gap-4 px-5 pb-4 text-xs"
        style={{ color: "var(--on-surface-variant)" }}
      >
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>group</span>
          {stats.donorCount} {Number(stats.donorCount) === 1 ? "donor" : "donors"}
        </span>
        {daysRemaining !== null && (
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>schedule</span>
            {daysRemaining > 0 ? `${daysRemaining} days left` : "Campaign ended"}
          </span>
        )}
        <span className="ml-auto font-medium" style={{ color: "var(--on-surface)" }}>
          ${stats.totalRaisedFormatted} USDC on-chain
        </span>
      </div>
    </div>
  );
}
