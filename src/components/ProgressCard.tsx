"use client";

import { Icon } from "./Icon";
import { Money } from "./Money";
import { ProgressBar } from "./ProgressBar";
import { GlassCard } from "./GlassCard";
import { AvatarDot } from "./AvatarDot";

interface ProgressCardProps {
  campaign: { goal: number; endDate: string };
  stats: { raised: number; donors: number; daysLeft: number };
  rate: number;
}

export function ProgressCard({ campaign, stats, rate }: ProgressCardProps) {
  const pct = Math.round((stats.raised / campaign.goal) * 100);
  return (
    <section className="progress-section">
      <GlassCard style={{ padding: 48, maxWidth: 1440, margin: "0 auto" }}>
        <div className="progress-grid">
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, gap: 24, flexWrap: "wrap" }}>
              <div>
                <p className="progress-label">Total Raised</p>
                <Money usd={stats.raised} rate={rate} size="xl" inline={false} decimals={0} />
                <p className="progress-meta" style={{ marginTop: 12 }}>
                  of <Money usd={campaign.goal} rate={rate} size="sm" decimals={0} /> goal · settles in USDC
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
                <p className="pstat-primary">{stats.donors}</p>
                <p className="pstat-secondary">unique contributors</p>
              </div>
              <div className="pstat-cell">
                <p className="pstat-label">Avg gift</p>
                <p className="pstat-primary">₦{new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 }).format(Math.round((stats.donors > 0 ? stats.raised / stats.donors : 0) * rate))}</p>
                <p className="pstat-secondary">≈ ${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(stats.donors > 0 ? Math.round(stats.raised / stats.donors) : 0)}</p>
              </div>
              <div className="pstat-cell">
                <p className="pstat-label">Disbursed</p>
                <p className="pstat-primary">₦{new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 }).format(Math.round(stats.raised * 0.94 * rate))}</p>
                <p className="pstat-secondary">≈ ${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(Math.round(stats.raised * 0.94))}</p>
              </div>
              <div className="pstat-cell">
                <p className="pstat-label">Goal Progress</p>
                <p className="pstat-primary">{pct}%</p>
                <p className="pstat-secondary">of ₦{new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 }).format(Math.round(campaign.goal * rate))} goal</p>
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
