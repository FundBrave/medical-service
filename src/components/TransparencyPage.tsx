"use client";

import { useState } from "react";
import { Icon } from "./Icon";
import { Money } from "./Money";
import { ProgressBar } from "./ProgressBar";
import { TopNavBar } from "./TopNavBar";
import { Footer } from "./Footer";

interface Campaign {
  title: string;
  location: string;
  goal: number;
  endDate: string;
}

interface Stats {
  raised: number;
  donors: number;
  daysLeft: number;
}

interface Flow {
  tone: string;
  icon: string;
  title: string;
  steps: string[];
  description: string;
}

interface Contract {
  label: string;
  address: string;
}

interface FeedItem {
  kind: string;
  usd: number;
  hash: string;
  time: string;
  detail: string;
}

interface Transparency {
  treasury: string;
  signers: string[];
  flows: Flow[];
  contracts: Contract[];
  feed: FeedItem[];
}

function TransparencyHeroProgress({ campaign, stats, rate }: { campaign: Campaign; stats: Stats; rate: number }) {
  const pct = Math.round((stats.raised / campaign.goal) * 100);
  const minGoal = Math.round(campaign.goal * 0.55);
  return (
    <section className="tp-hero">
      <div className="tp-hero-head">
        <div>
          <p className="subpage-eyebrow">Current Campaign</p>
          <h2 className="subpage-title" style={{ fontSize: 36 }}>
            {campaign.title}<br />
            <span style={{ color: "color-mix(in oklch, var(--primary) 70%, white)" }}>{campaign.location}</span>
          </h2>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 14, color: "var(--on-surface-variant)", fontWeight: 500, marginBottom: 4 }}>Campaign goal</div>
          <Money usd={campaign.goal} rate={rate} size="lg" inline={false} decimals={0} />
        </div>
      </div>
      <div className="tp-hero-body">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 24, flexWrap: "wrap" }}>
          <div>
            <p style={{ margin: 0, color: "var(--on-surface-variant)", fontSize: 14, fontWeight: 500, marginBottom: 8 }}>Raised so far</p>
            <Money usd={stats.raised} rate={rate} size="xl" inline={false} decimals={0} />
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: 0, color: "var(--secondary)", fontFamily: "var(--f-headline)", fontWeight: 800, fontSize: 28, letterSpacing: "-0.02em" }}>{pct}%</p>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color: "var(--on-surface-variant)", textTransform: "uppercase" }}>Funded</p>
          </div>
        </div>
        <ProgressBar value={stats.raised} max={campaign.goal} />
        <div className="tp-hero-stats">
          <div className="tp-hero-stat">
            <div className="tp-hero-stat-icon tertiary"><Icon name="event" size={20} /></div>
            <div>
              <p className="tp-hero-stat-label">Deadline</p>
              <p className="tp-hero-stat-value">{campaign.endDate}</p>
            </div>
          </div>
          <div className="tp-hero-stat">
            <div className="tp-hero-stat-icon primary"><Icon name="schedule" size={20} /></div>
            <div>
              <p className="tp-hero-stat-label">Time remaining</p>
              <p className="tp-hero-stat-value">{stats.daysLeft} days left</p>
            </div>
          </div>
          <div className="tp-hero-stat">
            <div className="tp-hero-stat-icon secondary"><Icon name="flag" size={20} /></div>
            <div>
              <p className="tp-hero-stat-label">Min. threshold</p>
              <p className="tp-hero-stat-value">
                <Money usd={minGoal} rate={rate} size="sm" hideUsd decimals={0} />
                {stats.raised >= minGoal && " (Met)"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TransparencyStatsGrid({ stats, rate }: { stats: Stats; rate: number }) {
  const cards = [
    { icon: "group", tone: "primary", label: "Unique donors", val: <p className="pstat-value" style={{ margin: 0 }}>{stats.donors}</p> },
    { icon: "payments", tone: "secondary", label: "Total raised", val: <Money usd={stats.raised} rate={rate} size="lg" inline={false} decimals={0} /> },
    { icon: "medication_liquid", tone: "tertiary", label: "Disbursed to hospital", val: <Money usd={stats.raised * 0.94} rate={rate} size="lg" inline={false} decimals={0} /> },
    { icon: "pending_actions", tone: "primary", label: "In escrow / pending", val: <Money usd={stats.raised * 0.06} rate={rate} size="lg" inline={false} decimals={0} /> },
  ];
  return (
    <div className="tp-grid-stats">
      {cards.map((c, i) => (
        <div key={i} className="tp-stat-card">
          <div className="tp-stat-card-head">
            <div className={`tp-stat-card-icon ${c.tone}`}><Icon name={c.icon} fill={1} /></div>
            <Icon name="north_east" className="tp-stat-card-arrow" size={18} />
          </div>
          <div className="tp-stat-card-val">{c.val}</div>
          <p className="tp-stat-card-label">{c.label}</p>
        </div>
      ))}
    </div>
  );
}

function TransparencyMultisig({ signers, treasury }: { signers: string[]; treasury: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try { await navigator.clipboard?.writeText(treasury); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {}
  };
  const required = Math.ceil(signers.length * 0.66);
  return (
    <div className="tp-multisig">
      <div>
        <div className="tp-card-head">
          <div className="tp-card-head-icon"><Icon name="shield" fill={1} /></div>
          <h3>Multisig treasury</h3>
        </div>
        <div className="tp-address-box" style={{ marginTop: 20 }}>
          <p className="tp-address-label">Gnosis Safe address</p>
          <div className="tp-address-row">
            <code className="tp-address-code">{treasury.slice(0, 6)}…{treasury.slice(-4)}</code>
            <button className="tp-copy-btn" onClick={handleCopy} title="Copy address"><Icon name={copied ? "check" : "content_copy"} size={18} /></button>
          </div>
        </div>
        <div className="tp-signers" style={{ marginTop: 24 }}>
          <p className="tp-signers-label">Required signers ({required}/{signers.length})</p>
          {signers.map((s, i) => (
            <div key={i} className="tp-signer-row">
              <span className={`tp-signer-dot ${i < required ? "on" : "off"}`} />
              <span style={{ color: i < required ? "var(--on-surface)" : "var(--on-surface-variant)" }}>{s}</span>
            </div>
          ))}
        </div>
      </div>
      <a className="tp-view-link" href="#">View Safe details →</a>
    </div>
  );
}

function TransparencyFundFlow({ flows }: { flows: Flow[] }) {
  return (
    <section className="tp-flow">
      <div className="tp-flow-head">
        <div className="tp-flow-head-icon"><Icon name="account_tree" /></div>
        <div>
          <h2>Fund flow</h2>
          <p>Where your money goes — fully on-chain</p>
        </div>
      </div>
      <div className="tp-flow-grid">
        {flows.map((flow, i) => (
          <div key={i} className="tp-flow-card">
            <div className="tp-flow-card-head">
              <div className={`tp-flow-card-icon ${flow.tone}`}><Icon name={flow.icon} fill={1} size={20} /></div>
              <h3>{flow.title}</h3>
            </div>
            <div className="tp-flow-steps">
              {flow.steps.map((step, si) => (
                <div key={si} className="tp-flow-step">
                  <div className="tp-flow-step-rail">
                    <span className={`tp-flow-step-dot ${flow.tone}`} />
                    {si < flow.steps.length - 1 && <span className="tp-flow-step-line" />}
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
  );
}

function TransparencyContracts({ contracts }: { contracts: Contract[] }) {
  return (
    <div className="tp-contracts">
      <div className="tp-contracts-head">
        <h3><Icon name="terminal" size={22} style={{ color: "var(--secondary)" }} /> Smart contracts</h3>
      </div>
      {contracts.map((c, i) => (
        <div key={i} className="tp-contract-row">
          <span className="label">{c.label}</span>
          <code>{c.address.slice(0, 6)}…{c.address.slice(-4)}</code>
        </div>
      ))}
    </div>
  );
}

function TransparencyActivityFeed({ feed, rate }: { feed: FeedItem[]; rate: number }) {
  return (
    <div className="tp-feed">
      <div className="tp-feed-head">
        <h3><Icon name="history" size={22} style={{ color: "var(--tertiary)" }} /> Recent activity</h3>
        <span className="tp-feed-live">Live feed</span>
      </div>
      <div className="tp-feed-list">
        {feed.map((row, i) => (
          <div key={i} className="tp-feed-row">
            <div className={`tp-feed-icon ${row.kind}`}>
              <Icon name={row.kind === "donate" ? "favorite" : row.kind === "disburse" ? "medication_liquid" : "autorenew"} fill={1} size={16} />
            </div>
            <div>
              <p className="tp-feed-row-l1">
                <b>{row.kind === "donate" ? "Donation" : row.kind === "disburse" ? "Disbursement" : "Sustainer"}</b>
                {" "}— <Money usd={row.usd} rate={rate} size="sm" hideUsd decimals={0} />
                {row.detail ? ` · ${row.detail}` : ""}
              </p>
              <p className="tp-feed-row-l2">{row.hash}</p>
            </div>
            <span className="tp-feed-row-time">{row.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TransparencyCTA({ beneficiaryCount, beneficiaryNoun, onDonate, onImpact }: { beneficiaryCount: string; beneficiaryNoun: string; onDonate: () => void; onImpact: () => void }) {
  return (
    <section className="tp-cta">
      <div>
        <h3>Ready to contribute?</h3>
        <p style={{ marginTop: 12 }}>
          Your gift directly funds care for {beneficiaryCount || "patients"} {beneficiaryNoun || ""}. Every disbursement is on-chain — no middlemen, no surprises.
        </p>
      </div>
      <div className="tp-cta-row">
        <button className="btn btn-tertiary-cta" onClick={onDonate} style={{ width: "100%" }}>Donate now</button>
        <button className="btn btn-outline" onClick={onImpact} style={{ flex: 1 }}>Become a sustainer</button>
      </div>
    </section>
  );
}

interface TransparencyPageProps {
  campaign: Campaign;
  stats: Stats;
  rate: number;
  transparency: Transparency;
  beneficiaryNoun: string;
  beneficiaryCount: string;
  activeView: string;
  onNavigate: (view: string) => void;
}

export function TransparencyPage({ campaign, stats, rate, transparency, beneficiaryNoun, beneficiaryCount, onNavigate, activeView }: TransparencyPageProps) {
  return (
    <>
      <TopNavBar activeView={activeView} onNavigate={onNavigate} />
      <main className="subpage-main">
        <div style={{ marginBottom: 32 }}>
          <p className="subpage-eyebrow">Transparency dashboard</p>
          <h1 className="subpage-title">Where every <span className="gradient-text">naira</span> goes</h1>
          <p className="subpage-sub">Public, real-time fund flow for {campaign.title}. Multisig governed, on-chain audited, no off-ledger transactions.</p>
        </div>
        <TransparencyHeroProgress campaign={campaign} stats={stats} rate={rate} />
        <section className="tp-grid-2">
          <TransparencyStatsGrid stats={stats} rate={rate} />
          <TransparencyMultisig signers={transparency.signers} treasury={transparency.treasury} />
        </section>
        <TransparencyFundFlow flows={transparency.flows} />
        <section className="tp-grid-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <TransparencyContracts contracts={transparency.contracts} />
          <TransparencyActivityFeed feed={transparency.feed} rate={rate} />
        </section>
        <TransparencyCTA beneficiaryCount={beneficiaryCount} beneficiaryNoun={beneficiaryNoun} onDonate={() => onNavigate("donate")} onImpact={() => onNavigate("impact")} />
      </main>
      <Footer />
    </>
  );
}
