"use client";

import { useState } from "react";
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

function ImpactPageHeader({ title, sub, accentText }: { title: string; sub: string; accentText?: string }) {
  return (
    <section className="imp-header">
      <div className="imp-header-icon"><Icon name="favorite" /></div>
      <h1 className="subpage-title" style={{ fontSize: 38, marginBottom: 4 }}>{title}</h1>
      <p className="subpage-sub" style={{ maxWidth: "32rem", textAlign: "center" }}>
        {sub} {accentText && <span style={{ color: "var(--primary)" }}>{accentText}</span>}
      </p>
    </section>
  );
}

function ImpactDeadlineBanner({ daysLeft }: { daysLeft: number }) {
  if (daysLeft == null) return null;
  const urgency = daysLeft <= 3 ? "critical" : daysLeft <= 7 ? "urgent" : daysLeft <= 30 ? "warning" : "notice";
  const msg = urgency === "critical"
    ? `⚠ Campaign ends in ${daysLeft} day${daysLeft === 1 ? "" : "s"}. Claim any pending impact before the deadline.`
    : urgency === "urgent"
    ? `Campaign ends in ${daysLeft} days. Claim impact before the deadline.`
    : urgency === "warning"
    ? `${daysLeft} days left — remember to claim your impact before the campaign closes.`
    : `Campaign closes in ${daysLeft} days. Withdraw your principal or claim impact any time before then.`;
  return (
    <div className={`imp-banner ${urgency}`}>
      <Icon name="schedule" />
      <p style={{ margin: 0 }}>{msg}</p>
    </div>
  );
}

function ImpactPositionCard({ principal, yieldEarned, causeShare, rate, onClaim, onCompound }: {
  principal: number; yieldEarned: number; causeShare: number; rate: number; onClaim: () => void; onCompound: () => void;
}) {
  const hasPosition = principal > 0;
  return (
    <div className="imp-position-card">
      <div className="imp-position-head">
        <div>
          <p className="imp-position-label">Your position</p>
          <Money usd={principal} rate={rate} size="xl" inline={false} decimals={0} />
          <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--on-surface-variant)" }}>
            principal supporting the campaign · withdrawable any time
          </p>
        </div>
        {hasPosition && <span className="imp-position-pill">Active</span>}
      </div>
      <div className="imp-position-yields">
        <div>
          <p className="imp-position-yield-label">Your share</p>
          <Money usd={yieldEarned * (1 - causeShare / 100)} rate={rate} size="md" decimals={2} />
        </div>
        <div>
          <p className="imp-position-yield-label">Campaign&apos;s share</p>
          <Money usd={yieldEarned * (causeShare / 100)} rate={rate} size="md" decimals={2} />
        </div>
      </div>
      <div className="imp-position-actions">
        <button className="imp-action-btn primary" onClick={onClaim} disabled={yieldEarned <= 0}>
          <Icon name="payments" size={16} /> Claim impact
        </button>
        <button className="imp-action-btn" onClick={onCompound} disabled={yieldEarned <= 0}>
          <Icon name="autorenew" size={16} /> Compound
        </button>
      </div>
    </div>
  );
}

function ImpactSplitConfigurator({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="imp-split">
      <div className="imp-split-head">
        <h4>Yield split to campaign</h4>
        <span className="pct">{value}%</span>
      </div>
      <input type="range" min="10" max="100" step="5" className="imp-split-track" value={value} onChange={(e) => onChange(parseInt(e.target.value, 10))} />
      <div className="imp-split-legend">
        <span>You keep {100 - value}%</span>
        <span>Campaign gets {value}%</span>
      </div>
    </div>
  );
}

function ImpactTerminal({ tab, setTab, amount, setAmount, onAction, processing, rate }: {
  tab: string; setTab: (t: string) => void; amount: string; setAmount: (a: string) => void;
  onAction: () => void; processing: boolean; rate: number;
}) {
  const isStake = tab === "stake";
  const numericAmount = parseFloat(amount) || 0;
  return (
    <div className="imp-terminal">
      <div className="imp-terminal-tabs">
        <button className={`imp-terminal-tab${isStake ? " active" : ""}`} onClick={() => setTab("stake")}>Deposit</button>
        <button className={`imp-terminal-tab${!isStake ? " active" : ""}`} onClick={() => setTab("unstake")}>Withdraw</button>
      </div>
      <div className="donate-section">
        <label className="donate-label">{isStake ? "Amount to deposit" : "Amount to withdraw"}</label>
        <div className="amount-input-wrap">
          <input type="text" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="0.00" className="amount-input" aria-label="Amount" />
          <div className="amount-input-suffix">USD</div>
        </div>
        {numericAmount > 0 && (
          <p style={{ margin: "8px 4px 0", fontSize: 13, color: "var(--on-surface-variant)" }}>≈ ₦{formatNGN(numericAmount, rate)} NGN</p>
        )}
      </div>
      <button className="btn-tertiary-cta" onClick={onAction} disabled={!numericAmount || processing}>
        {processing ? (
          <><Icon name="progress_activity" className="spin" />{isStake ? "Depositing…" : "Withdrawing…"}</>
        ) : (
          <><Icon name={isStake ? "savings" : "payments"} fill={1} />{isStake ? `Deposit $${amount || "0"}` : `Withdraw $${amount || "0"}`}</>
        )}
      </button>
    </div>
  );
}

function ImpactContextStats({ tvl, generatedImpact, supporters, rate }: { tvl: number; generatedImpact: number; supporters: number; rate: number }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      <div style={{ background: "var(--surface-container-low)", borderRadius: 24, padding: 24, border: "1px solid rgba(67, 70, 85, .15)" }}>
        <p className="imp-position-label">Total value supporting</p>
        <Money usd={tvl} rate={rate} size="lg" inline={false} decimals={0} />
      </div>
      <div style={{ background: "var(--surface-container-low)", borderRadius: 24, padding: 24, border: "1px solid rgba(67, 70, 85, .15)" }}>
        <p className="imp-position-label">Impact generated</p>
        <Money usd={generatedImpact} rate={rate} size="lg" inline={false} decimals={0} />
        <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--on-surface-variant)" }}>
          <Icon name="groups" size={14} />
          <span>{supporters} supporters</span>
        </div>
      </div>
    </div>
  );
}

function ImpactLoop({ steps }: { steps: LoopStep[] }) {
  return (
    <section className="imp-loop">
      <p className="imp-loop-title">The impact loop</p>
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
  const [causeShare, setCauseShare] = useState(80);
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
        showToast("Deposit confirmed — your principal is now supporting the campaign.");
      } else {
        setPosition((p) => ({ ...p, principal: Math.max(0, p.principal - num) }));
        showToast("Withdraw confirmed — funds returned to your account.");
      }
      setAmount("");
      setProcessing(false);
    }, 1600);
  };

  const handleClaim = () => {
    if (position.yieldEarned <= 0) return;
    showToast(`Impact claimed — ${(position.yieldEarned * (1 - causeShare / 100)).toFixed(2)} USD returned to you.`);
    setPosition((p) => ({ ...p, yieldEarned: 0 }));
  };

  const handleCompound = () => {
    if (position.yieldEarned <= 0) return;
    showToast("Yield compounded into your principal.");
    setPosition((p) => ({ principal: p.principal + p.yieldEarned, yieldEarned: 0 }));
  };

  return (
    <>
      <TopNavBar activeView={activeView} onNavigate={onNavigate} />
      <main className="subpage-main subpage-narrow" style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <ImpactPageHeader title={impact.title || "Support to fund care"} sub={impact.sub} accentText={impact.accent} />
        <ImpactDeadlineBanner daysLeft={stats.daysLeft} />
        <ImpactPositionCard principal={position.principal} yieldEarned={position.yieldEarned} causeShare={causeShare} rate={rate} onClaim={handleClaim} onCompound={handleCompound} />
        <ImpactSplitConfigurator value={causeShare} onChange={setCauseShare} />
        <ImpactTerminal tab={tab} setTab={setTab} amount={amount} setAmount={setAmount} onAction={handleAction} processing={processing} rate={rate} />
        <ImpactContextStats tvl={impact.tvl} generatedImpact={impact.generatedImpact} supporters={impact.supporters} rate={rate} />
        <ImpactLoop steps={impact.loopSteps} />
      </main>
      <Footer />
      {toast && (
        <div style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          background: "var(--surface-container-high)", color: "var(--on-surface)",
          padding: "12px 20px", borderRadius: 12, border: "1px solid var(--outline-variant)",
          boxShadow: "0 12px 40px rgba(0,0,0,.4)", zIndex: 90, fontSize: 14, maxWidth: "90vw",
        }}>
          {toast}
        </div>
      )}
    </>
  );
}
