"use client";

import { useState } from "react";
import { Icon } from "./Icon";
import { Money } from "./Money";
import { ProgressBar } from "./ProgressBar";
import { FundBraveLogo } from "./Logos";
import { formatNGN } from "@/lib/format";

function shortenAddress(addr: string) {
  return addr.slice(0, 6) + "…" + addr.slice(-4);
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: 16 }}>
      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: "0 0 4px" }}>{label}</p>
      <p style={{ fontSize: 20, fontWeight: 700, color: "#fff", margin: 0 }}>{value}</p>
      {sub && <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: "4px 0 0" }}>{sub}</p>}
    </div>
  );
}

interface AdminPageProps {
  campaign: { title: string; goal: number; goalNGN?: number };
  stats: { raised: number; donors: number; daysLeft: number };
  rate: number;
  transparency: {
    treasury: string;
    signers: string[];
    contracts: { label: string; address: string }[];
  };
  onBack: () => void;
}

export function AdminPage({ campaign, stats, rate, transparency, onBack }: AdminPageProps) {
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawDone, setWithdrawDone] = useState(false);
  const [harvesting, setHarvesting] = useState(false);
  const [harvestDone, setHarvestDone] = useState(false);

  const progressPct = Math.min(100, Math.round((stats.raised / campaign.goal) * 100));
  const minGoalReached = stats.raised >= campaign.goal * 0.55;
  const campaignEnded = stats.daysLeft <= 0;
  const canWithdraw = campaignEnded && minGoalReached;
  const usdcBalance = stats.raised * 0.94;

  const handleWithdraw = () => {
    setWithdrawing(true);
    setConfirmWithdraw(false);
    setTimeout(() => { setWithdrawing(false); setWithdrawDone(true); }, 2000);
  };

  const handleHarvest = () => {
    setHarvesting(true);
    setTimeout(() => { setHarvesting(false); setHarvestDone(true); }, 2000);
  };

  const required = Math.ceil(transparency.signers.length * 0.66);

  return (
    <div style={{ minHeight: "100vh", background: "#0A0E1A", color: "#fff" }}>
      {/* Header */}
      <header style={{
        borderBottom: "1px solid rgba(255,255,255,0.1)", background: "rgba(10,14,26,0.8)",
        backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{ maxWidth: 768, margin: "0 auto", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={onBack} style={{ background: "none", border: 0, color: "rgba(255,255,255,0.6)", cursor: "pointer", display: "flex" }}>
              <Icon name="arrow_back" size={20} />
            </button>
            <FundBraveLogo size={28} />
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "#111827", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 9999, padding: "4px 12px",
            }}>
              <Icon name="shield" size={14} style={{ color: "var(--tertiary)" }} />
              <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.7)" }}>Admin</span>
            </div>
          </div>
          <button className="btn btn-primary-flat" style={{ fontSize: 12 }}>
            <Icon name="account_balance_wallet" size={14} />
            Connect Wallet
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 768, margin: "0 auto", padding: "32px 16px", display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Auth status */}
        <div style={{
          background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)",
          borderRadius: 12, padding: 12, display: "flex", alignItems: "center", gap: 8, fontSize: 14,
        }}>
          <Icon name="check_circle" size={16} fill={1} style={{ color: "#10B981" }} />
          <span style={{ color: "#6ee7b7" }}>Authenticated as treasury — {shortenAddress(transparency.treasury)}</span>
        </div>

        {/* Campaign overview */}
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h2 style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.1em", margin: 0 }}>Campaign</h2>
            <button style={{ background: "none", border: 0, color: "rgba(255,255,255,0.4)", cursor: "pointer" }} title="Refresh">
              <Icon name="refresh" size={16} />
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 12 }}>
            <StatCard label="Total Raised" value={`₦${formatNGN(stats.raised, rate)}`} sub={`${progressPct}% of ₦${new Intl.NumberFormat("en-NG").format(campaign.goalNGN || Math.round(campaign.goal * rate))}`} />
            <StatCard label="USDC in Contract" value={`$${Math.round(usdcBalance).toLocaleString()}`} sub="available to withdraw" />
            <StatCard label="Donors" value={stats.donors.toString()} />
            <StatCard label="Status" value={stats.daysLeft > 0 ? "Active" : "Ended"} sub={`${stats.daysLeft} days remaining`} />
          </div>
          <div style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>
              <span>Progress to minimum goal</span>
              <span style={{ color: minGoalReached ? "#10B981" : "#f59e0b" }}>
                {minGoalReached ? "✓ Goal reached" : "Goal not yet reached"}
              </span>
            </div>
            <ProgressBar value={stats.raised} max={campaign.goal} />
          </div>
        </section>

        {/* Treasury withdrawal */}
        <section style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: 20 }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <Icon name="account_balance" size={20} style={{ color: "var(--tertiary)", marginTop: 2 }} />
            <div>
              <h2 style={{ fontWeight: 600, margin: 0 }}>Withdraw to Treasury</h2>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: "4px 0 0" }}>
                Transfers all campaign USDC to the treasury multisig.
              </p>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(255,255,255,0.6)" }}>
              <span>Treasury address</span>
              <span style={{ fontFamily: "var(--f-mono)", color: "rgba(255,255,255,0.8)" }}>{shortenAddress(transparency.treasury)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(255,255,255,0.6)" }}>
              <span>Available USDC</span>
              <span style={{ fontWeight: 600, color: "#fff" }}>${Math.round(usdcBalance).toLocaleString()}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(255,255,255,0.6)" }}>
              <span>Min goal reached</span>
              <span style={{ color: minGoalReached ? "#10B981" : "#f59e0b" }}>{minGoalReached ? "Yes ✓" : "No — withdrawal blocked"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(255,255,255,0.6)" }}>
              <span>Campaign ended</span>
              <span style={{ color: campaignEnded ? "#10B981" : "#f59e0b" }}>{campaignEnded ? "Yes ✓" : "Still active"}</span>
            </div>
          </div>

          {!canWithdraw && (
            <div style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 12, padding: 12, fontSize: 12, color: "#fbbf24", marginBottom: 16 }}>
              Withdrawal is only possible after the campaign deadline passes AND the minimum goal is reached.
            </div>
          )}

          {canWithdraw && !confirmWithdraw && !withdrawDone && !withdrawing && (
            <button className="btn-tertiary-cta" onClick={() => setConfirmWithdraw(true)}>
              Withdraw ${Math.round(usdcBalance).toLocaleString()} to Treasury
            </button>
          )}

          {confirmWithdraw && (
            <div style={{ background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.2)", borderRadius: 12, padding: 16 }}>
              <p style={{ fontSize: 14, color: "#fca5a5", fontWeight: 500, margin: "0 0 12px" }}>
                Confirm withdrawal of ${Math.round(usdcBalance).toLocaleString()} USDC to treasury?
              </p>
              <p style={{ fontSize: 12, color: "rgba(252,165,165,0.7)", margin: "0 0 16px" }}>
                This action is irreversible.
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={handleWithdraw} style={{ flex: 1, padding: "10px 16px", borderRadius: 12, fontWeight: 600, fontSize: 14, background: "#dc2626", color: "#fff", border: 0, cursor: "pointer" }}>Confirm Withdraw</button>
                <button onClick={() => setConfirmWithdraw(false)} style={{ flex: 1, padding: "10px 16px", borderRadius: 12, fontWeight: 600, fontSize: 14, background: "rgba(255,255,255,0.1)", color: "#fff", border: 0, cursor: "pointer" }}>Cancel</button>
              </div>
            </div>
          )}

          {withdrawing && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "rgba(255,255,255,0.6)" }}>
              <Icon name="progress_activity" className="spin" size={16} /> Confirming transaction…
            </div>
          )}

          {withdrawDone && (
            <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 12, padding: 12, display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#6ee7b7" }}>
              <Icon name="check_circle" size={16} fill={1} /> Withdrawal confirmed
            </div>
          )}
        </section>

        {/* Staking harvest */}
        <section style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: 20 }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <Icon name="bolt" size={20} style={{ color: "var(--primary)", marginTop: 2 }} />
            <div>
              <h2 style={{ fontWeight: 600, margin: 0 }}>Harvest Staking Yield</h2>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: "4px 0 0" }}>
                Pulls Aave yield and distributes staker / campaign shares. Anyone can call this.
              </p>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
            <StatCard label="Total Staked" value="$0.00" />
            <StatCard label="Unrealized Yield" value="$0.00" sub="pending harvest" />
            <StatCard label="Last Harvest" value="Never" />
          </div>
          {!harvestDone ? (
            <button
              onClick={handleHarvest}
              disabled={harvesting}
              style={{
                width: "100%", padding: "12px 16px", borderRadius: 12, fontWeight: 600, fontSize: 14,
                background: harvesting ? "rgba(37,99,235,0.4)" : "#2563EB", color: "#fff", border: 0,
                cursor: harvesting ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              {harvesting ? <><Icon name="progress_activity" className="spin" size={16} /> Confirming…</> : <><Icon name="trending_up" size={16} /> Harvest &amp; Distribute Yield</>}
            </button>
          ) : (
            <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 12, padding: 12, display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#6ee7b7" }}>
              <Icon name="check_circle" size={16} fill={1} /> Harvest confirmed
            </div>
          )}
        </section>

        {/* Multisig info */}
        <section style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: 20 }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <Icon name="groups" size={20} style={{ color: "rgba(255,255,255,0.5)", marginTop: 2 }} />
            <div>
              <h2 style={{ fontWeight: 600, margin: 0 }}>Treasury Multisig</h2>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: "4px 0 0" }}>
                Gnosis Safe — {required}-of-{transparency.signers.length} required signatures
              </p>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(255,255,255,0.6)" }}>
              <span>Safe address</span>
              <span style={{ fontFamily: "var(--f-mono)", color: "rgba(255,255,255,0.8)" }}>{shortenAddress(transparency.treasury)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(255,255,255,0.6)" }}>
              <span>Required signatures</span>
              <span style={{ color: "rgba(255,255,255,0.8)" }}>{required} of {transparency.signers.length}</span>
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.15em", margin: "0 0 8px" }}>Signers</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {transparency.signers.map((signer, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: "8px 12px" }}>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>#{i + 1}</span>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", flex: 1 }}>{signer}</span>
                  {i === 0 && (
                    <span style={{ fontSize: 11, background: "rgba(16,185,129,0.2)", color: "#6ee7b7", padding: "2px 8px", borderRadius: 9999 }}>you</span>
                  )}
                </div>
              ))}
            </div>
          </div>
          <a href="#" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "10px 16px", borderRadius: 12, fontSize: 14, fontWeight: 500, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", textDecoration: "none" }}>
            Open in Gnosis Safe <Icon name="open_in_new" size={14} />
          </a>
        </section>

        {/* Contract addresses */}
        <section style={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 20, padding: 20 }}>
          <h2 style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 12px" }}>Contracts</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 14 }}>
            {transparency.contracts.map((c, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "rgba(255,255,255,0.5)" }}>{c.label}</span>
                <a href="#" style={{ fontFamily: "var(--f-mono)", fontSize: 12, color: "rgba(255,255,255,0.7)", display: "flex", alignItems: "center", gap: 4, textDecoration: "none" }}>
                  {shortenAddress(c.address)} <Icon name="open_in_new" size={12} />
                </a>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
