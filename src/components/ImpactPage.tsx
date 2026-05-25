"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "./Icon";
import { Money } from "./Money";
import { TopNavBar } from "./TopNavBar";
import { Footer } from "./Footer";
import { formatNGN } from "@/lib/format";

interface LoopStep {
  title: string;
  desc: string;
}

interface Impact {
  title: string;
  sub: string;
  accent: string;
  tvl: number;
  generatedImpact: number;
  supporters: number;
  demoPrincipal: number;
  demoYield: number;
  loopSteps: LoopStep[];
}

interface ImpactPageProps {
  campaign: { title: string; goal: number };
  stats: { raised: number; donors: number; daysLeft: number };
  rate: number;
  impact: Impact;
  activeView: string;
  onNavigate: (view: string) => void;
}

function StakePageHeader() {
  return (
    <section className="imp-header">
      <div className="imp-header-icon"><Icon name="savings" size={36} fill={1} /></div>
      <h1 className="subpage-title" style={{ fontSize: 38, marginBottom: 4 }}>Stake to Support</h1>
      <p className="subpage-sub" style={{ maxWidth: "36rem", textAlign: "center" }}>
        Deposit USDC into Aave V3 on Base. Your principal stays yours. The yield funds medical care for two parents fighting cancer.
      </p>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 16, padding: "6px 14px", borderRadius: 9999, background: "rgba(180, 197, 255, 0.1)", border: "1px solid rgba(180, 197, 255, 0.2)" }}>
        <Icon name="trending_up" size={14} style={{ color: "var(--primary)" }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--primary)" }}>Variable APY · Aave V3</span>
      </div>
    </section>
  );
}

function StakeDeadlineBanner({ daysLeft }: { daysLeft: number }) {
  if (daysLeft == null) return null;
  const urgency = daysLeft <= 3 ? "critical" : daysLeft <= 7 ? "urgent" : daysLeft <= 30 ? "warning" : "notice";
  const msg = urgency === "critical"
    ? `⚠ Campaign ends in ${daysLeft} day${daysLeft === 1 ? "" : "s"}. Unstake and claim yield before the deadline.`
    : urgency === "urgent"
    ? `Campaign ends in ${daysLeft} days. Claim your yield before the deadline.`
    : urgency === "warning"
    ? `${daysLeft} days left — remember to claim yield or unstake before the campaign closes.`
    : `Campaign closes in ${daysLeft} days. Unstake or claim yield any time before then.`;
  return (
    <div className={`imp-banner ${urgency}`}>
      <Icon name="schedule" />
      <p style={{ margin: 0 }}>{msg}</p>
    </div>
  );
}

function StakePositionCard({ principal, yieldEarned, causeShare, rate, onClaim, onCompound }: {
  principal: number; yieldEarned: number; causeShare: number; rate: number; onClaim: () => void; onCompound: () => void;
}) {
  const hasPosition = principal > 0;
  const yourYield = yieldEarned * (1 - causeShare / 100);
  const campaignYield = yieldEarned * (causeShare / 100);
  return (
    <div className="imp-position-card">
      <div className="imp-position-head">
        <div>
          <p className="imp-position-label">Your staked position</p>
          <Money usd={principal} rate={rate} size="xl" inline={false} decimals={2} />
          <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--on-surface-variant)" }}>
            USDC deposited into Aave V3 · withdrawable any time
          </p>
        </div>
        {hasPosition && <span className="imp-position-pill">Earning yield</span>}
      </div>
      <div className="imp-position-yields">
        <div>
          <p className="imp-position-yield-label">Your yield</p>
          <Money usd={yourYield} rate={rate} size="md" decimals={4} />
        </div>
        <div>
          <p className="imp-position-yield-label">Campaign&apos;s yield</p>
          <Money usd={campaignYield} rate={rate} size="md" decimals={4} />
          <p style={{ margin: "4px 0 0", fontSize: 11, color: "var(--on-surface-variant)" }}>
            → funds dialysis &amp; surgery
          </p>
        </div>
      </div>
      <div className="imp-position-actions">
        <button className="imp-action-btn" onClick={onCompound} disabled={yieldEarned <= 0}>
          <Icon name="autorenew" size={16} /> Compound
        </button>
        <button className="imp-action-btn primary" onClick={onClaim} disabled={yieldEarned <= 0}>
          <Icon name="payments" size={16} /> Claim Yield
        </button>
      </div>
    </div>
  );
}

const SPLIT_PRESETS = [
  { label: "Default", campaign: 79, you: 21 },
  { label: "Generous", campaign: 90, you: 10 },
  { label: "Max Donate", campaign: 98, you: 0 },
];

function StakeSplitConfigurator({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="imp-split">
      <div className="imp-split-head">
        <h4>Yield split</h4>
        <span className="pct">{value}%</span>
      </div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", height: 8, borderRadius: 9999, overflow: "hidden", background: "var(--surface-variant)" }}>
          <div style={{ width: `${value}%`, background: "linear-gradient(90deg, var(--primary-container), var(--secondary-container))", borderRadius: 9999, transition: "width 0.2s" }} />
        </div>
      </div>
      <input type="range" min="10" max="100" step="1" className="imp-split-track" value={value} onChange={(e) => onChange(parseInt(e.target.value, 10))} />
      <div className="imp-split-legend">
        <span>You keep {100 - value}%</span>
        <span>Campaign gets {value}%</span>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        {SPLIT_PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => onChange(p.campaign)}
            style={{
              flex: 1, padding: "8px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600,
              background: value === p.campaign ? "var(--surface-container-high)" : "transparent",
              border: `1px solid ${value === p.campaign ? "rgba(180, 197, 255, 0.3)" : "rgba(67, 70, 85, 0.2)"}`,
              color: value === p.campaign ? "var(--primary)" : "var(--on-surface-variant)",
              cursor: "pointer",
            }}
          >
            {p.label}
            <span style={{ display: "block", fontSize: 10, fontWeight: 400, marginTop: 2, color: "var(--on-surface-variant)" }}>
              {p.campaign}/{p.you}
            </span>
          </button>
        ))}
      </div>
      <p style={{ fontSize: 11, color: "rgba(195, 198, 215, 0.4)", margin: "8px 0 0" }}>
        2% platform fee applied to campaign&apos;s share
      </p>
    </div>
  );
}

const STAKE_PRESETS = [25, 50, 100, 250, 500];

function StakeTerminal({ tab, setTab, amount, setAmount, onAction, processing, rate, causeShare }: {
  tab: string; setTab: (t: string) => void; amount: string; setAmount: (a: string) => void;
  onAction: () => void; processing: boolean; rate: number; causeShare: number;
}) {
  const isStake = tab === "stake";
  const numericAmount = parseFloat(amount) || 0;
  const yieldPreview = numericAmount * 0.04;
  return (
    <div className="imp-terminal">
      <div className="imp-terminal-tabs">
        <button className={`imp-terminal-tab${isStake ? " active" : ""}`} onClick={() => setTab("stake")}>Stake</button>
        <button className={`imp-terminal-tab${!isStake ? " active" : ""}`} onClick={() => setTab("unstake")}>Unstake</button>
      </div>
      <div className="donate-section">
        <label className="donate-label">{isStake ? "Amount to stake" : "Amount to unstake"}</label>
        <div className="amount-input-wrap">
          <input type="text" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="0.00" className="amount-input" aria-label="Amount" />
          <div className="amount-input-suffix">USDC</div>
        </div>
        {numericAmount > 0 && (
          <p style={{ margin: "8px 4px 0", fontSize: 13, color: "var(--on-surface-variant)" }}>
            ≈ ₦{formatNGN(numericAmount, rate)} NGN
          </p>
        )}
        {isStake && (
          <div className="preset-row" style={{ marginTop: 12 }}>
            {STAKE_PRESETS.map((p) => (
              <button key={p} className={`preset-btn${parseFloat(amount) === p ? " active" : ""}`} onClick={() => setAmount(p.toString())}>
                ${p}
              </button>
            ))}
          </div>
        )}
      </div>

      {isStake && numericAmount > 0 && (
        <div style={{
          background: "rgba(180, 197, 255, 0.08)", border: "1px solid rgba(180, 197, 255, 0.15)",
          borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 8,
        }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", margin: 0, textTransform: "uppercase", letterSpacing: "0.1em" }}>Yield preview (est.)</p>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
            <span style={{ color: "var(--on-surface-variant)" }}>Annual yield (~4% APY)</span>
            <span style={{ fontWeight: 700, color: "var(--on-surface)" }}>${yieldPreview.toFixed(2)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
            <span style={{ color: "var(--on-surface-variant)" }}>→ To campaign ({causeShare}%)</span>
            <span style={{ fontWeight: 700, color: "var(--tertiary)" }}>${(yieldPreview * causeShare / 100).toFixed(2)}/yr</span>
          </div>
          <p style={{ fontSize: 11, color: "rgba(195, 198, 215, 0.5)", margin: 0 }}>
            Your ${numericAmount} USDC stays yours. Only the yield is split.
          </p>
        </div>
      )}

      <button className="btn-tertiary-cta" onClick={onAction} disabled={!numericAmount || processing} style={{ background: isStake ? "linear-gradient(135deg, var(--primary-container), var(--secondary-container))" : undefined }}>
        {processing ? (
          <><Icon name="progress_activity" className="spin" />{isStake ? "Staking…" : "Unstaking…"}</>
        ) : (
          <><Icon name={isStake ? "savings" : "payments"} fill={1} />{isStake ? `Stake $${amount || "0"} USDC` : `Unstake $${amount || "0"} USDC`}</>
        )}
      </button>
    </div>
  );
}

function StakeContextStats({ tvl, generatedImpact, supporters, rate }: { tvl: number; generatedImpact: number; supporters: number; rate: number }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <div style={{ background: "var(--surface-container-low)", borderRadius: 24, padding: 24, border: "1px solid rgba(67, 70, 85, .15)" }}>
        <p className="imp-position-label">Total value locked</p>
        <Money usd={tvl} rate={rate} size="lg" inline={false} decimals={0} />
        <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--on-surface-variant)" }}>
          <Icon name="groups" size={14} />
          <span>{supporters} stakers</span>
        </div>
      </div>
      <div style={{ background: "var(--surface-container-low)", borderRadius: 24, padding: 24, border: "1px solid rgba(67, 70, 85, .15)" }}>
        <p className="imp-position-label">Yield sent to campaign</p>
        <Money usd={generatedImpact} rate={rate} size="lg" inline={false} decimals={0} />
        <p style={{ margin: "8px 0 0", fontSize: 11, color: "var(--on-surface-variant)" }}>
          funding dialysis &amp; surgery costs
        </p>
      </div>
    </div>
  );
}

function StakeImpactLoop({ steps }: { steps: LoopStep[] }) {
  return (
    <section className="imp-loop">
      <p className="imp-loop-title">How staking works</p>
      <div className="imp-loop-steps">
        {steps.map((step, i) => (
          <div key={i} className="imp-loop-step">
            <div className="imp-loop-num">{i + 1}</div>
            <div className="imp-loop-card">
              <h4>{step.title}</h4>
              <p>{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function ImpactPage({ campaign, stats, rate, impact, activeView, onNavigate }: ImpactPageProps) {
  const [position, setPosition] = useState({ principal: impact.demoPrincipal || 0, yieldEarned: impact.demoYield || 0 });
  const [causeShare, setCauseShare] = useState(79);
  const [tab, setTab] = useState("stake");
  const [amount, setAmount] = useState("");
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2400); };

  const handleAction = () => {
    const num = parseFloat(amount) || 0;
    if (num <= 0) return;
    setProcessing(true);
    setTimeout(() => {
      if (tab === "stake") {
        setPosition((p) => ({ ...p, principal: p.principal + num }));
        showToast(`Staked $${num} USDC into Aave V3. Yield is now being generated.`);
      } else {
        setPosition((p) => ({ ...p, principal: Math.max(0, p.principal - num) }));
        showToast(`Unstaked $${num} USDC. Funds returned to your wallet.`);
      }
      setAmount("");
      setProcessing(false);
    }, 1600);
  };

  const handleClaim = () => {
    if (position.yieldEarned <= 0) return;
    const yourShare = (position.yieldEarned * (1 - causeShare / 100)).toFixed(4);
    showToast(`Yield claimed — $${yourShare} USDC sent to your wallet.`);
    setPosition((p) => ({ ...p, yieldEarned: 0 }));
  };

  const handleCompound = () => {
    if (position.yieldEarned <= 0) return;
    showToast("Yield compounded into your staked position.");
    setPosition((p) => ({ principal: p.principal + p.yieldEarned, yieldEarned: 0 }));
  };

  return (
    <>
      <TopNavBar activeView={activeView} onNavigate={onNavigate} />
      <main className="subpage-main subpage-narrow" style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <StakePageHeader />
        <StakeDeadlineBanner daysLeft={stats.daysLeft} />
        <StakePositionCard principal={position.principal} yieldEarned={position.yieldEarned} causeShare={causeShare} rate={rate} onClaim={handleClaim} onCompound={handleCompound} />
        <StakeSplitConfigurator value={causeShare} onChange={setCauseShare} />
        <StakeTerminal tab={tab} setTab={setTab} amount={amount} setAmount={setAmount} onAction={handleAction} processing={processing} rate={rate} causeShare={causeShare} />
        <StakeContextStats tvl={impact.tvl} generatedImpact={impact.generatedImpact} supporters={impact.supporters} rate={rate} />
        <StakeImpactLoop steps={impact.loopSteps} />
      </main>
      <Footer />
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            style={{
              position: "fixed", bottom: 24, left: "50%",
              background: "var(--surface-container-high)", color: "var(--on-surface)",
              padding: "12px 20px", borderRadius: 12, border: "1px solid var(--outline-variant)",
              boxShadow: "0 12px 40px rgba(0,0,0,.4)", zIndex: 90, fontSize: 14, maxWidth: "90vw",
            }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
