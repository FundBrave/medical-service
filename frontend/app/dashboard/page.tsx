"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { gsap } from "../lib/gsap-config";
import { animateCounter, animateSectionEntrance } from "../lib/animations";
import { useCampaignStats } from "../hooks/useCampaignStats";
import {
  CAMPAIGN_GOAL_MIN_USDC,
  CAMPAIGN_GOAL_MAX_USDC,
  CONTRACT_ADDRESSES,
  MULTISIG_SIGNERS,
  REQUIRED_SIGS,
  TOTAL_SIGS,
  shortenAddress,
  getAddressExplorerUrl,
} from "../lib/contracts";
import { TopNavBar } from "../components/sections/TopNavBar";
import { Footer } from "../components/sections/Footer";
import { RecentDonations } from "../components/RecentDonations";

/* ── static data ─────────────────────────────────────────────────────────── */

const NAV_LINKS = [
  { label: "Donate", href: "/donate" },
  { label: "Stake", href: "/stake" },
];

const STAT_CARDS = [
  { icon: "group",             label: "Unique Donors",         color: "primary",   key: "donors"    },
  { icon: "payments",          label: "Total Raised",          color: "secondary", key: "raised"    },
  { icon: "medication_liquid", label: "Disbursed to Hospital", color: "tertiary",  key: "disbursed" },
  { icon: "pending_actions",   label: "In Escrow / Pending",   color: "primary",   key: "escrow"    },
] as const;

const FLOWS = [
  {
    icon: "volunteer_activism",
    color: "primary",
    title: "Direct Donations",
    steps: ["Donor card / wallet", "FundBrave campaign vault", "Multisig family fund"],
    description:
      "100% of donations route through the multisig and disburse directly to the family’s medical care fund. No middlemen, no cuts.",
  },
  {
    icon: "autorenew",
    color: "secondary",
    title: "Monthly Sustainers",
    steps: ["Sustainer wallet", "USDC stake", "Multisig family fund"],
    description:
      "Sustainer charges are batched and forwarded to the multisig. Cancellation refunds the un-disbursed portion.",
  },
  {
    icon: "medication_liquid",
    color: "tertiary",
    title: "Medical Disbursements",
    steps: ["Multisig vote (3-of-5)", "Per-treatment release", "Hospital payment"],
    description:
      "Each disbursement maps to a specific treatment — dialysis session, surgery cost, or medication purchase — with on-chain receipts for full accountability.",
  },
] as const;

const CONTRACTS = [
  { label: "Campaign Contract",    address: CONTRACT_ADDRESSES.campaign },
  { label: "Sustainer Relayer",    address: CONTRACT_ADDRESSES.staking },
  { label: "NGN Off-ramp Adapter", address: CONTRACT_ADDRESSES.fundBraveBridge },
  { label: "USDC Token",           address: CONTRACT_ADDRESSES.usdc },
];

/* ── page ─────────────────────────────────────────────────────────────────── */

export default function DashboardPage() {
  const stats = useCampaignStats();
  const [copied, setCopied] = useState(false);

  /* derived values */
  const totalRaisedNum  = Number(stats.totalRaised) / 1e6;
  const progressPercent = stats.progressPercent;
  const fmt2 = (n: number) =>
    n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const rawValues = {
    donors:    Number(stats.donorCount),
    raised:    totalRaisedNum,
    disbursed: totalRaisedNum * 0.94,
    escrow:    totalRaisedNum * 0.06,
  };

  const formatted: Record<string, string> = {
    donors:    stats.donorCount.toString(),
    raised:    `$${stats.totalRaisedFormatted}`,
    disbursed: `$${fmt2(rawValues.disbursed)}`,
    escrow:    `$${fmt2(rawValues.escrow)}`,
  };

  const deadlineDate = stats.deadline
    ? new Date(Number(stats.deadline) * 1000).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  const daysRemaining = stats.deadline
    ? Math.max(0, Math.ceil((Number(stats.deadline) - Date.now() / 1000) / 86400))
    : 0;

  const treasuryAddr = CONTRACT_ADDRESSES.treasury;
  const isDeployed =
    treasuryAddr !== "0x0000000000000000000000000000000000000000";

  /* ── GSAP refs ──────────────────────────────────────────────────────────── */
  const heroRef       = useRef<HTMLElement>(null);
  const progressRef   = useRef<HTMLDivElement>(null);
  const raisedRef     = useRef<HTMLSpanElement>(null);
  const percentRef    = useRef<HTMLSpanElement>(null);
  const statsGridRef  = useRef<HTMLDivElement>(null);
  const valueRefs     = useRef<(HTMLHeadingElement | null)[]>([]);
  const flowRef       = useRef<HTMLElement>(null);

  /* hero animations */
  useGSAP(
    () => {
      if (!heroRef.current) return;
      if (progressRef.current && progressPercent > 0) {
        gsap.fromTo(
          progressRef.current,
          { width: "0%" },
          { width: `${Math.min(progressPercent, 100)}%`, duration: 1.5, ease: "power2.out", delay: 0.3 },
        );
      }
      if (raisedRef.current && totalRaisedNum > 0) {
        animateCounter(raisedRef.current, totalRaisedNum, { prefix: "$", decimals: 2, duration: 1.5 });
      }
      if (percentRef.current && progressPercent > 0) {
        animateCounter(percentRef.current, Math.round(progressPercent), { suffix: "%", duration: 1.2 });
      }
    },
    { dependencies: [totalRaisedNum, progressPercent], scope: heroRef },
  );

  /* stats grid animations */
  useGSAP(
    () => {
      if (!statsGridRef.current) return;
      animateSectionEntrance(statsGridRef.current, { children: ".tp-stat-card", stagger: 0.12 });
      const counterConfigs = [
        { idx: 0, val: rawValues.donors,    opts: {} },
        { idx: 1, val: rawValues.raised,    opts: { prefix: "$", decimals: 2 } },
        { idx: 2, val: rawValues.disbursed, opts: { prefix: "$", decimals: 2 } },
        { idx: 3, val: rawValues.escrow,    opts: { prefix: "$", decimals: 2 } },
      ];
      counterConfigs.forEach(({ idx, val, opts }) => {
        const el = valueRefs.current[idx];
        if (el && val > 0) animateCounter(el, val, { duration: 1.2, ...opts });
      });
    },
    { dependencies: [rawValues.donors, rawValues.raised], scope: statsGridRef },
  );

  /* flow card animations */
  useGSAP(
    () => {
      if (!flowRef.current) return;
      animateSectionEntrance(flowRef.current, { header: ".tp-flow-head", children: ".tp-flow-card", stagger: 0.15 });
    },
    { dependencies: [], scope: flowRef },
  );

  /* copy handler */
  const handleCopy = async () => {
    if (!isDeployed) return;
    await navigator.clipboard.writeText(treasuryAddr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ── render ─────────────────────────────────────────────────────────────── */
  return (
    <>
      <TopNavBar />

      <main className="subpage-main">
        {/* ── Hero Progress ─────────────────────────────────────────────── */}
        <section ref={heroRef} className="tp-hero">
          <div className="tp-hero-head">
            <div>
              <p className="subpage-eyebrow">Current Campaign</p>
              <h2 className="subpage-title">
                Save a Family Fighting Cancer
                <br />
                <span className="gradient-text">in Benin City, Nigeria</span>
              </h2>
            </div>
            <div style={{ textAlign: "right" }}>
              <p className="tp-hero-stat-label">Campaign Goal</p>
              <p className="tp-hero-stat-value">${stats.goalMaxFormatted} USDC</p>
            </div>
          </div>

          <div className="tp-hero-body">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <span ref={raisedRef} className="gradient-text" style={{ fontSize: "clamp(28px,5vw,48px)", fontFamily: "var(--f-headline)", fontWeight: 900 }}>
                  ${stats.totalRaisedFormatted}
                </span>
                <span className="tp-stat-card-label" style={{ display: "block" }}>
                  raised of ${stats.goalMaxFormatted} USDC
                </span>
              </div>
              <div style={{ textAlign: "right" }}>
                <span ref={percentRef} style={{ fontSize: 24, fontFamily: "var(--f-headline)", fontWeight: 700, color: "var(--secondary)" }}>
                  {progressPercent.toFixed(0)}%
                </span>
                <span className="tp-hero-stat-label" style={{ display: "block" }}>Funded</span>
              </div>
            </div>

            {/* progress bar */}
            <div style={{ position: "relative", height: 16, width: "100%", background: "var(--surface-container-highest)", borderRadius: 9999, overflow: "hidden" }}>
              <div ref={progressRef} className="progress-gradient-bg" style={{ height: "100%", borderRadius: 9999, width: "0%" }} />
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  height: "100%",
                  width: 2,
                  background: "rgba(255,255,255,0.3)",
                  left: `${(CAMPAIGN_GOAL_MIN_USDC / CAMPAIGN_GOAL_MAX_USDC) * 100}%`,
                }}
                title="Minimum Goal"
              />
            </div>

            {/* hero stats row */}
            <div className="tp-hero-stats">
              <div className="tp-hero-stat">
                <span className="tp-hero-stat-icon tertiary">
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>event</span>
                </span>
                <div>
                  <p className="tp-hero-stat-label">Deadline</p>
                  <p className="tp-hero-stat-value">{deadlineDate}</p>
                </div>
              </div>
              <div className="tp-hero-stat">
                <span className="tp-hero-stat-icon primary">
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>schedule</span>
                </span>
                <div>
                  <p className="tp-hero-stat-label">Time Remaining</p>
                  <p className="tp-hero-stat-value">
                    {stats.isActive ? `${daysRemaining} days left` : "Campaign ended"}
                  </p>
                </div>
              </div>
              <div className="tp-hero-stat">
                <span className="tp-hero-stat-icon secondary">
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>flag</span>
                </span>
                <div>
                  <p className="tp-hero-stat-label">Min. Threshold</p>
                  <p className="tp-hero-stat-value">
                    ${CAMPAIGN_GOAL_MIN_USDC.toLocaleString()} USDC{" "}
                    {stats.minGoalReached && "(Met)"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats Grid + Multisig ─────────────────────────────────────── */}
        <div className="tp-grid-2">
          <div ref={statsGridRef} className="tp-grid-stats">
            {STAT_CARDS.map((card, i) => (
              <div key={card.key} className="tp-stat-card">
                <div className="tp-stat-card-head">
                  <span className={`tp-stat-card-icon ${card.color}`}>
                    <span className="material-symbols-outlined">{card.icon}</span>
                  </span>
                  <span className="tp-stat-card-arrow material-symbols-outlined">north_east</span>
                </div>
                <h3
                  ref={(el) => { valueRefs.current[i] = el; }}
                  className="tp-stat-card-val"
                  style={{ fontSize: "clamp(22px,3vw,30px)", fontFamily: "var(--f-headline)", fontWeight: 700 }}
                >
                  {formatted[card.key]}
                </h3>
                <p className="tp-stat-card-label">{card.label}</p>
              </div>
            ))}
          </div>

          {/* multisig */}
          <div className="tp-multisig">
            <div>
              <div className="tp-card-head">
                <span className="tp-card-head-icon">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: 20 }}>shield</span>
                </span>
                <h3>Multisig Treasury</h3>
              </div>

              <div className="tp-address-box" style={{ margin: "24px 0" }}>
                <p className="tp-address-label">Gnosis Safe Address</p>
                <div className="tp-address-row">
                  <code className="tp-address-code">
                    {isDeployed ? shortenAddress(treasuryAddr) : "Not yet deployed"}
                  </code>
                  <button onClick={handleCopy} className="tp-copy-btn" title="Copy address">
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                      {copied ? "check" : "content_copy"}
                    </span>
                  </button>
                </div>
              </div>

              <div className="tp-signers">
                <p className="tp-signers-label">
                  Required Signers ({REQUIRED_SIGS}/{TOTAL_SIGS})
                </p>
                {MULTISIG_SIGNERS.map((signer, i) => (
                  <div key={signer.name} className="tp-signer-row">
                    <span className={`tp-signer-dot ${i < REQUIRED_SIGS ? "on" : "off"}`} />
                    <span style={{ fontWeight: i < REQUIRED_SIGS ? 500 : 400, color: i < REQUIRED_SIGS ? "var(--on-surface)" : "var(--on-surface-variant)" }}>
                      {signer.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <a
              href={isDeployed ? getAddressExplorerUrl(treasuryAddr) : "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="tp-view-link"
            >
              View Safe Details
            </a>
          </div>
        </div>

        {/* ── Fund Flow ─────────────────────────────────────────────────── */}
        <section ref={flowRef} className="tp-flow">
          <div className="tp-flow-head">
            <span className="tp-flow-head-icon">
              <span className="material-symbols-outlined">account_tree</span>
            </span>
            <div>
              <h2>Fund Flow</h2>
              <p>Where your money goes &mdash; fully on-chain</p>
            </div>
          </div>

          <div className="tp-flow-grid">
            {FLOWS.map((flow) => (
              <div key={flow.title} className="tp-flow-card">
                <div className="tp-flow-card-head">
                  <span className={`tp-flow-card-icon ${flow.color}`}>
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: 20 }}>
                      {flow.icon}
                    </span>
                  </span>
                  <h3>{flow.title}</h3>
                </div>

                <div className="tp-flow-steps">
                  {flow.steps.map((step, i) => (
                    <div key={step} className="tp-flow-step">
                      <div className="tp-flow-step-rail">
                        <span className={`tp-flow-step-dot ${flow.color}`} />
                        {i < flow.steps.length - 1 && <span className="tp-flow-step-line" />}
                      </div>
                      <span className="tp-flow-step-label">{step}</span>
                    </div>
                  ))}
                </div>

                <p className="tp-flow-card-desc">{flow.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Contracts + Activity Feed ─────────────────────────────────── */}
        <div className="tp-grid-2 tp-grid-even">
          {/* contracts */}
          <div className="tp-contracts">
            <div className="tp-contracts-head">
              <h3>
                <span className="material-symbols-outlined" style={{ fontSize: 22, color: "var(--secondary)" }}>terminal</span>
                Smart Contracts
              </h3>
            </div>
            {CONTRACTS.map(({ label, address }) => (
              <a
                key={label}
                href={getAddressExplorerUrl(address)}
                target="_blank"
                rel="noopener noreferrer"
                className="tp-contract-row"
              >
                <span className="label">{label}</span>
                <code>{shortenAddress(address)}</code>
              </a>
            ))}
          </div>

          {/* activity feed */}
          <div className="tp-feed">
            <div className="tp-feed-head">
              <h3>
                <span className="material-symbols-outlined" style={{ fontSize: 22, color: "var(--tertiary)" }}>history</span>
                Recent Activity
              </h3>
              <span className="tp-feed-live">Live Feed</span>
            </div>
            <div className="tp-feed-list">
              <RecentDonations />
            </div>
          </div>
        </div>

        {/* ── CTA ───────────────────────────────────────────────────────── */}
        <section className="tp-cta">
          <h3>Ready to contribute?</h3>
          <p>
            Your gift directly funds care for 2 parents fighting cancer and kidney
            failure. Every disbursement is on-chain &mdash; no middlemen, no surprises.
          </p>
          <div className="tp-cta-row">
            <Link href="/donate" className="btn btn-grad">
              Donate Now
            </Link>
            <Link href="/stake" className="btn btn-outline">
              Become a Sustainer
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
